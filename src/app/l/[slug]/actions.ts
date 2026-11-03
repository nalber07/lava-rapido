"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { erro, mensagemErro, sucesso, type Resultado } from "@/lib/resultado";
import { criarCheckout, type Referencia } from "@/lib/mercadopago";
import { urlDoSite } from "@/lib/site";
import type { FormaPagamento } from "@/lib/types";

const txt = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function completarCadastro(empresaId: string, slug: string, _: Resultado, fd: FormData): Promise<Resultado> {
  const nome = txt(fd, "nome");
  if (nome.length < 2) return erro("Informe seu nome.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("vincular_cliente", { p_empresa: empresaId, p_nome: nome, p_telefone: txt(fd, "telefone") || null });
  if (error) return erro(mensagemErro(error));
  revalidatePath(`/l/${slug}`, "layout");
  return sucesso();
}

export async function adicionarVeiculo(
  empresaId: string,
  clienteId: string,
  slug: string,
  _: Resultado,
  fd: FormData,
): Promise<Resultado> {
  const placa = txt(fd, "placa").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (placa.length < 5) return erro("Informe a placa do veículo.");
  const supabase = await createClient();
  const { error } = await supabase.from("veiculos").insert({
    empresa_id: empresaId,
    cliente_id: clienteId,
    placa,
    modelo: txt(fd, "modelo") || null,
    cor: txt(fd, "cor") || null,
    tipo: txt(fd, "tipo") || "carro",
  });
  if (error) return erro(mensagemErro(error));
  revalidatePath(`/l/${slug}`, "layout");
  return sucesso("Veículo cadastrado.");
}

export async function removerVeiculo(id: string, slug: string) {
  const supabase = await createClient();
  await supabase.from("veiculos").delete().eq("id", id);
  revalidatePath(`/l/${slug}/conta`);
}

export async function buscarHorarios(empresaId: string, data: string, servicoId: string): Promise<string[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return [];
  const supabase = await createClient();
  const { data: slots } = await supabase.rpc("horarios_disponiveis", { p_empresa: empresaId, p_data: data, p_servico: servicoId });
  return ((slots ?? []) as { inicio: string }[]).map((s) => s.inicio);
}

/** Gera o link de pagamento no Mercado Pago da empresa. */
async function linkPagamento(opts: {
  empresaId: string;
  slug: string;
  referencia: Referencia;
  titulo: string;
  valorCentavos: number;
  email?: string | null;
}) {
  const admin = createAdminClient();
  const { data } = await admin.from("empresa_segredos").select("mp_access_token").eq("empresa_id", opts.empresaId).maybeSingle();
  if (!data?.mp_access_token) throw new Error("Pagamento online indisponível. Escolha pagar no local.");
  const site = await urlDoSite();
  return criarCheckout({
    tokenEmpresa: data.mp_access_token,
    empresaId: opts.empresaId,
    referencia: opts.referencia,
    titulo: opts.titulo,
    valorCentavos: opts.valorCentavos,
    email: opts.email,
    site,
    voltarPara: `${site}/l/${opts.slug}/conta?pagamento=1`,
  });
}

export type RespostaAgendar = { ok: false; mensagem: string } | { ok: true; redirecionar: string };

export async function agendar(input: {
  empresaId: string;
  slug: string;
  veiculoId: string;
  servicoId: string;
  inicio: string;
  forma: FormaPagamento;
  observacoes?: string;
}): Promise<RespostaAgendar> {
  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("criar_agendamento", {
    p_empresa: input.empresaId,
    p_veiculo: input.veiculoId,
    p_servico: input.servicoId,
    p_inicio: input.inicio,
    p_forma: input.forma,
    p_observacoes: input.observacoes ?? null,
  });
  if (error) return { ok: false, mensagem: mensagemErro(error) };
  revalidatePath(`/l/${input.slug}/conta`);

  if (input.forma === "pix" || input.forma === "cartao") {
    try {
      const { data: ag } = await supabase.from("agendamentos").select("servico_nome, valor_centavos").eq("id", id).single();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const url = await linkPagamento({
        empresaId: input.empresaId,
        slug: input.slug,
        referencia: { tipo: "agendamento", id },
        titulo: ag?.servico_nome ?? "Lavagem",
        valorCentavos: ag?.valor_centavos ?? 0,
        email: user?.email,
      });
      return { ok: true, redirecionar: url };
    } catch {
      return { ok: true, redirecionar: `/l/${input.slug}/conta?agendado=1&falhaPagamento=1` };
    }
  }
  return { ok: true, redirecionar: `/l/${input.slug}/conta?agendado=1` };
}

export async function pagarAgendamento(id: string, slug: string) {
  const supabase = await createClient();
  const { data: ag } = await supabase.from("agendamentos").select("empresa_id, servico_nome, valor_centavos, status_pagamento").eq("id", id).single();
  if (!ag || ag.status_pagamento === "pago") redirect(`/l/${slug}/conta`);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = await linkPagamento({
    empresaId: ag.empresa_id,
    slug,
    referencia: { tipo: "agendamento", id },
    titulo: ag.servico_nome,
    valorCentavos: ag.valor_centavos,
    email: user?.email,
  });
  redirect(url);
}

export async function cancelarMeuAgendamento(id: string, slug: string) {
  const supabase = await createClient();
  await supabase.rpc("cancelar_agendamento", { p_id: id });
  revalidatePath(`/l/${slug}/conta`);
}

export async function comprar(input: {
  empresaId: string;
  slug: string;
  itens: { produto_id: string; quantidade: number }[];
  forma: "no_local" | "pix" | "cartao";
}): Promise<RespostaAgendar> {
  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("criar_pedido", { p_empresa: input.empresaId, p_itens: input.itens, p_forma: input.forma });
  if (error) return { ok: false, mensagem: mensagemErro(error) };
  revalidatePath(`/l/${input.slug}/conta`);
  if (input.forma !== "no_local") {
    try {
      const { data: p } = await supabase.from("pedidos").select("total_centavos").eq("id", id).single();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const url = await linkPagamento({
        empresaId: input.empresaId,
        slug: input.slug,
        referencia: { tipo: "pedido", id },
        titulo: "Produtos",
        valorCentavos: p?.total_centavos ?? 0,
        email: user?.email,
      });
      return { ok: true, redirecionar: url };
    } catch {
      return { ok: true, redirecionar: `/l/${input.slug}/conta?pedido=1&falhaPagamento=1` };
    }
  }
  return { ok: true, redirecionar: `/l/${input.slug}/conta?pedido=1` };
}

export async function assinarPlano(planoId: string, slug: string, online: boolean) {
  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("assinar_plano_cliente", { p_plano: planoId });
  if (error) redirect(`/l/${slug}/conta?erro=${encodeURIComponent(mensagemErro(error))}`);
  if (online) {
    const { data: plano } = await supabase.from("planos_cliente").select("empresa_id, nome, preco_centavos").eq("id", planoId).single();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let url: string | null = null;
    try {
      url = await linkPagamento({
        empresaId: plano!.empresa_id,
        slug,
        referencia: { tipo: "assinatura_cliente", id },
        titulo: `Plano ${plano!.nome} (1 mês)`,
        valorCentavos: plano!.preco_centavos,
        email: user?.email,
      });
    } catch {
      url = null;
    }
    if (url) redirect(url);
  }
  revalidatePath(`/l/${slug}/conta`);
  redirect(`/l/${slug}/conta?plano=1`);
}
