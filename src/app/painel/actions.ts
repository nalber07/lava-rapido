"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assinaturaLiberada, exigirDono, exigirPainel, getUsuario } from "@/lib/auth";
import { erro, mensagemErro, sucesso, type Resultado } from "@/lib/resultado";
import { OFFSET, paraCentavos, slugify } from "@/lib/format";
import type { FormaPagamento, StatusAgendamento, StatusPedido } from "@/lib/types";
import { planoPorId } from "@/lib/planos";
import { criarAssinaturaPlataforma } from "@/lib/mercadopago";
import { urlDoSite } from "@/lib/site";

const txt = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const opc = (fd: FormData, k: string) => txt(fd, k) || null;

async function paraEscrita(apenasDono = false) {
  const ctx = apenasDono ? await exigirDono() : await exigirPainel();
  if (!assinaturaLiberada(ctx.empresa)) {
    throw new Error("Assinatura vencida: regularize para voltar a editar.");
  }
  return { ctx, supabase: await createClient() };
}

async function tentar(fn: () => Promise<Resultado>): Promise<Resultado> {
  try {
    return await fn();
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // redirect()
    return erro(e instanceof Error ? e.message : "Algo deu errado.");
  }
}

// ---------------------------------------------------------------------------
// Empresa
// ---------------------------------------------------------------------------
export async function criarEmpresa(_: Resultado, fd: FormData): Promise<Resultado> {
  const user = await getUsuario();
  if (!user) redirect("/entrar");
  const nome = txt(fd, "empresa");
  const slug = slugify(txt(fd, "slug") || nome);
  if (nome.length < 2) return erro("Informe o nome do lava rápido.");
  if (slug.length < 3) return erro("O endereço precisa ter pelo menos 3 letras.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("criar_empresa", { p_nome: nome, p_slug: slug, p_telefone: opc(fd, "telefone") });
  if (error) return erro(error.code === "23505" ? "Esse endereço já está em uso." : mensagemErro(error));
  revalidatePath("/painel", "layout");
  redirect("/painel");
}

export async function salvarEmpresa(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const slug = slugify(txt(fd, "slug"));
    if (slug.length < 3) return erro("O endereço precisa ter pelo menos 3 letras.");
    const dias = fd.getAll("dias").map(Number).filter((n) => n >= 0 && n <= 6);
    if (dias.length === 0) return erro("Marque pelo menos um dia de funcionamento.");
    const abre = txt(fd, "abre");
    const fecha = txt(fd, "fecha");
    if (abre >= fecha) return erro("O horário de fechamento precisa ser depois da abertura.");
    const { error } = await supabase
      .from("empresas")
      .update({
        nome: txt(fd, "nome"),
        slug,
        descricao: opc(fd, "descricao"),
        telefone: opc(fd, "telefone"),
        whatsapp: opc(fd, "whatsapp"),
        endereco: opc(fd, "endereco"),
        cidade: opc(fd, "cidade"),
        abre,
        fecha,
        dias_funcionamento: dias,
        vagas_simultaneas: Number(fd.get("vagas")) || 1,
        intervalo_minutos: Number(fd.get("intervalo")) || 30,
      })
      .eq("id", ctx.empresa.id);
    if (error) return erro(error.code === "23505" ? "Esse endereço já está em uso." : mensagemErro(error));
    revalidatePath("/painel", "layout");
    return sucesso("Dados salvos.");
  });
}

export async function enviarLogo(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const arquivo = fd.get("logo");
    if (!(arquivo instanceof File) || arquivo.size === 0) return erro("Escolha uma imagem.");
    if (arquivo.size > 3 * 1024 * 1024) return erro("A imagem pode ter no máximo 3 MB.");
    const url = await subirImagem(supabase, ctx.empresa.id, "logo", arquivo);
    await supabase.from("empresas").update({ logo_url: url }).eq("id", ctx.empresa.id);
    revalidatePath("/painel", "layout");
    return sucesso("Logo atualizada.");
  });
}

async function subirImagem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  empresaId: string,
  pasta: string,
  arquivo: File,
) {
  const ext = (arquivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const caminho = `${empresaId}/${pasta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("fotos").upload(caminho, arquivo, {
    contentType: arquivo.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error("Não foi possível enviar a imagem.");
  return supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

export async function salvarTokenMP(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const token = txt(fd, "token");
    if (token && !/^(APP_USR|TEST)-/.test(token)) return erro("O Access Token começa com APP_USR- ou TEST-.");
    const { error } = await supabase.rpc("salvar_token_mp", { p_empresa: ctx.empresa.id, p_token: token });
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/configuracoes");
    return sucesso(token ? "Pagamento online ativado." : "Pagamento online desativado.");
  });
}

export async function convidarMembro(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const email = txt(fd, "email");
    if (!email.includes("@")) return erro("Informe um e-mail válido.");
    const { data, error } = await supabase.rpc("convidar_membro", { p_empresa: ctx.empresa.id, p_email: email });
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/configuracoes");
    return sucesso(
      data === "adicionado"
        ? "Pronto! Essa pessoa já tem acesso ao painel."
        : "Convite registrado. Quando essa pessoa criar a conta com esse e-mail, terá acesso.",
    );
  });
}

export async function removerMembro(usuarioId: string) {
  const { ctx, supabase } = await paraEscrita(true);
  await supabase.from("membros").delete().eq("empresa_id", ctx.empresa.id).eq("usuario_id", usuarioId);
  revalidatePath("/painel/configuracoes");
}

export async function removerConvite(id: string) {
  const { supabase } = await paraEscrita(true);
  await supabase.from("convites").delete().eq("id", id);
  revalidatePath("/painel/configuracoes");
}

// ---------------------------------------------------------------------------
// Clientes e veículos
// ---------------------------------------------------------------------------
export async function salvarCliente(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita();
    const id = opc(fd, "id");
    const dados = {
      empresa_id: ctx.empresa.id,
      nome: txt(fd, "nome"),
      telefone: opc(fd, "telefone"),
      email: opc(fd, "email"),
      observacoes: opc(fd, "observacoes"),
    };
    if (dados.nome.length < 2) return erro("Informe o nome do cliente.");
    if (id) {
      const { error } = await supabase.from("clientes").update(dados).eq("id", id);
      if (error) return erro(mensagemErro(error));
      revalidatePath(`/painel/clientes/${id}`);
      return sucesso("Cliente atualizado.");
    }
    const { data, error } = await supabase.from("clientes").insert(dados).select("id").single();
    if (error) return erro(mensagemErro(error));
    const placa = txt(fd, "placa").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (placa) {
      await supabase.from("veiculos").insert({
        empresa_id: ctx.empresa.id,
        cliente_id: data.id,
        placa,
        modelo: opc(fd, "modelo"),
        cor: opc(fd, "cor"),
      });
    }
    revalidatePath("/painel/clientes");
    redirect(`/painel/clientes/${data.id}`);
  });
}

export async function excluirCliente(id: string) {
  const { supabase } = await paraEscrita(true);
  await supabase.from("clientes").delete().eq("id", id);
  revalidatePath("/painel/clientes");
  redirect("/painel/clientes");
}

export async function salvarVeiculo(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita();
    const clienteId = txt(fd, "cliente_id");
    const placa = txt(fd, "placa").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (placa.length < 5) return erro("Informe a placa.");
    const { error } = await supabase.from("veiculos").insert({
      empresa_id: ctx.empresa.id,
      cliente_id: clienteId,
      placa,
      modelo: opc(fd, "modelo"),
      cor: opc(fd, "cor"),
      tipo: txt(fd, "tipo") || "carro",
    });
    if (error) return erro(mensagemErro(error));
    revalidatePath(`/painel/clientes/${clienteId}`);
    return sucesso("Veículo adicionado.");
  });
}

export async function excluirVeiculo(id: string, clienteId: string) {
  const { supabase } = await paraEscrita();
  await supabase.from("veiculos").delete().eq("id", id);
  revalidatePath(`/painel/clientes/${clienteId}`);
}

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------
export async function criarAgendamentoManual(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita();
    const veiculoId = txt(fd, "veiculo_id");
    const servicoId = txt(fd, "servico_id");
    const data = txt(fd, "data");
    const horaInicio = txt(fd, "hora");
    if (!veiculoId || !servicoId || !data || !horaInicio) return erro("Preencha cliente, serviço, dia e horário.");

    const [{ data: veiculo }, { data: servico }] = await Promise.all([
      supabase.from("veiculos").select("id, cliente_id").eq("id", veiculoId).single(),
      supabase.from("servicos").select("*").eq("id", servicoId).single(),
    ]);
    if (!veiculo || !servico) return erro("Cliente ou serviço inválido.");

    const inicio = new Date(`${data}T${horaInicio}:00${OFFSET}`);
    const fim = new Date(inicio.getTime() + servico.duracao_minutos * 60000);
    const { error } = await supabase.from("agendamentos").insert({
      empresa_id: ctx.empresa.id,
      cliente_id: veiculo.cliente_id,
      veiculo_id: veiculo.id,
      servico_id: servico.id,
      servico_nome: servico.nome,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      valor_centavos: fd.get("valor") ? paraCentavos(fd.get("valor")) : servico.preco_centavos,
      forma_pagamento: "no_local",
      observacoes: opc(fd, "observacoes"),
    });
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/agenda");
    revalidatePath("/painel");
    redirect(`/painel/agenda?dia=${data}`);
  });
}

export async function mudarStatusAgendamento(id: string, status: StatusAgendamento) {
  const { supabase } = await paraEscrita();
  if (status === "cancelado") {
    await supabase.rpc("cancelar_agendamento", { p_id: id });
  } else {
    await supabase.from("agendamentos").update({ status }).eq("id", id);
  }
  revalidatePath(`/painel/agenda/${id}`);
  revalidatePath("/painel/agenda");
  revalidatePath("/painel");
}

export async function registrarPagamento(id: string, fd: FormData) {
  const { supabase } = await paraEscrita();
  const forma = (txt(fd, "forma") || "dinheiro") as FormaPagamento;
  await supabase.from("agendamentos").update({ status_pagamento: "pago", forma_pagamento: forma }).eq("id", id);
  revalidatePath(`/painel/agenda/${id}`);
  revalidatePath("/painel");
}

export async function enviarFotos(id: string, tipo: "antes" | "depois", _: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita();
    const arquivos = fd.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
    if (arquivos.length === 0) return erro("Escolha pelo menos uma foto.");
    if (arquivos.some((f) => f.size > 8 * 1024 * 1024)) return erro("Cada foto pode ter até 8 MB.");
    const urls = await Promise.all(arquivos.slice(0, 6).map((f) => subirImagem(supabase, ctx.empresa.id, `atendimentos/${id}`, f)));
    const coluna = tipo === "antes" ? "fotos_antes" : "fotos_depois";
    const { data: atual } = await supabase.from("agendamentos").select(coluna).eq("id", id).single();
    const existentes = ((atual as Record<string, string[]> | null)?.[coluna] ?? []) as string[];
    await supabase.from("agendamentos").update({ [coluna]: [...existentes, ...urls] }).eq("id", id);
    revalidatePath(`/painel/agenda/${id}`);
    return sucesso(`${urls.length} foto(s) adicionada(s).`);
  });
}

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------
export async function salvarServico(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const id = opc(fd, "id");
    const dados = {
      empresa_id: ctx.empresa.id,
      nome: txt(fd, "nome"),
      descricao: opc(fd, "descricao"),
      preco_centavos: paraCentavos(fd.get("preco")),
      duracao_minutos: Number(fd.get("duracao")) || 30,
    };
    if (dados.nome.length < 2) return erro("Informe o nome do serviço.");
    const { error } = id
      ? await supabase.from("servicos").update(dados).eq("id", id)
      : await supabase.from("servicos").insert(dados);
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/catalogo");
    return sucesso(id ? "Serviço atualizado." : "Serviço criado.");
  });
}

export async function alternarAtivo(tabela: "servicos" | "produtos" | "planos_cliente", id: string, ativo: boolean) {
  const { supabase } = await paraEscrita(true);
  await supabase.from(tabela).update({ ativo }).eq("id", id);
  revalidatePath("/painel/catalogo");
  revalidatePath("/painel/fidelidade");
}

export async function salvarProduto(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const id = opc(fd, "id");
    const dados: Record<string, unknown> = {
      empresa_id: ctx.empresa.id,
      nome: txt(fd, "nome"),
      descricao: opc(fd, "descricao"),
      preco_centavos: paraCentavos(fd.get("preco")),
      estoque: Math.max(0, Number(fd.get("estoque")) || 0),
    };
    if (String(dados.nome).length < 2) return erro("Informe o nome do produto.");
    const foto = fd.get("foto");
    if (foto instanceof File && foto.size > 0) {
      if (foto.size > 3 * 1024 * 1024) return erro("A foto pode ter no máximo 3 MB.");
      dados.foto_url = await subirImagem(supabase, ctx.empresa.id, "produtos", foto);
    }
    const { error } = id
      ? await supabase.from("produtos").update(dados).eq("id", id)
      : await supabase.from("produtos").insert(dados);
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/catalogo");
    return sucesso(id ? "Produto atualizado." : "Produto criado.");
  });
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------
export async function mudarStatusPedido(id: string, status: StatusPedido) {
  const { supabase } = await paraEscrita();
  await supabase.from("pedidos").update({ status }).eq("id", id);
  revalidatePath("/painel/pedidos");
}

export async function registrarPagamentoPedido(id: string) {
  const { supabase } = await paraEscrita();
  await supabase.from("pedidos").update({ status_pagamento: "pago" }).eq("id", id);
  revalidatePath("/painel/pedidos");
}

// ---------------------------------------------------------------------------
// Financeiro
// ---------------------------------------------------------------------------
export async function criarLancamento(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const valor = paraCentavos(fd.get("valor"));
    if (valor <= 0) return erro("Informe um valor maior que zero.");
    const { error } = await supabase.from("lancamentos").insert({
      empresa_id: ctx.empresa.id,
      tipo: txt(fd, "tipo") === "entrada" ? "entrada" : "saida",
      categoria: txt(fd, "categoria") || "outros",
      descricao: txt(fd, "descricao") || "Lançamento",
      valor_centavos: valor,
      data: txt(fd, "data") || undefined,
    });
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/financeiro");
    return sucesso("Lançamento registrado.");
  });
}

export async function excluirLancamento(id: string) {
  const { supabase } = await paraEscrita(true);
  await supabase.from("lancamentos").delete().eq("id", id);
  revalidatePath("/painel/financeiro");
}

// ---------------------------------------------------------------------------
// Fidelidade e planos mensais
// ---------------------------------------------------------------------------
export async function salvarFidelidade(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const { error } = await supabase
      .from("empresas")
      .update({ fidelidade_ativa: fd.get("ativa") === "on", fidelidade_meta: Number(fd.get("meta")) || 10 })
      .eq("id", ctx.empresa.id);
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/fidelidade");
    return sucesso("Cartão fidelidade salvo.");
  });
}

export async function salvarPlanoCliente(_: Resultado, fd: FormData): Promise<Resultado> {
  return tentar(async () => {
    const { ctx, supabase } = await paraEscrita(true);
    const dados = {
      empresa_id: ctx.empresa.id,
      servico_id: txt(fd, "servico_id"),
      nome: txt(fd, "nome"),
      descricao: opc(fd, "descricao"),
      preco_centavos: paraCentavos(fd.get("preco")),
      lavagens_mes: Number(fd.get("lavagens")) || 4,
    };
    if (dados.nome.length < 2 || !dados.servico_id) return erro("Informe o nome e o serviço do plano.");
    const { error } = await supabase.from("planos_cliente").insert(dados);
    if (error) return erro(mensagemErro(error));
    revalidatePath("/painel/fidelidade");
    return sucesso("Plano criado.");
  });
}

export async function ativarAssinaturaCliente(id: string) {
  const { supabase } = await paraEscrita();
  await supabase.rpc("ativar_assinatura_cliente", { p_id: id });
  revalidatePath("/painel/fidelidade");
}

export async function cancelarAssinaturaCliente(id: string) {
  const { supabase } = await paraEscrita();
  await supabase.from("assinaturas_cliente").update({ status: "cancelada" }).eq("id", id);
  revalidatePath("/painel/fidelidade");
}

// ---------------------------------------------------------------------------
// Assinatura da plataforma (dono paga o app)
// ---------------------------------------------------------------------------
export async function assinarPlataforma(planoId: string) {
  const ctx = await exigirDono();
  const plano = planoPorId(planoId);
  const url = await criarAssinaturaPlataforma({
    empresaId: ctx.empresa.id,
    planoId: plano.id,
    nomePlano: plano.nome,
    valorCentavos: plano.preco_centavos,
    email: ctx.email,
    voltarPara: `${await urlDoSite()}/painel/assinatura?retorno=1`,
  });
  redirect(url);
}
