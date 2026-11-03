import type { Metadata } from "next";
import { getClienteAtual, getEmpresaPorSlug } from "@/lib/vitrine";
import { createClient } from "@/lib/supabase/server";
import { CompletarCadastro, PedirLogin } from "../acesso";
import { FluxoAgendamento } from "./fluxo";
import { hojeISO } from "@/lib/format";
import type { Servico, Veiculo } from "@/lib/types";

export const metadata: Metadata = { title: "Agendar" };

export default async function Agendar({ params, searchParams }: PageProps<"/l/[slug]/agendar">) {
  const { slug } = await params;
  const sp = await searchParams;
  const e = await getEmpresaPorSlug(slug);
  const { user, cliente } = await getClienteAtual(e.id);

  const titulo = <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight">Agendar lavagem</h1>;
  if (!user) {
    return (
      <>
        {titulo}
        <PedirLogin slug={slug} destino={`/l/${slug}/agendar`} texto="Crie sua conta em um minuto para agendar e acompanhar a lavagem." />
      </>
    );
  }
  if (!cliente) {
    const meta = user.user_metadata as Record<string, string>;
    return (
      <>
        {titulo}
        <CompletarCadastro empresaId={e.id} slug={slug} nome={meta?.nome} telefone={meta?.telefone} />
      </>
    );
  }

  const supabase = await createClient();
  const [{ data: servicos }, { data: veiculos }, { data: assinaturas }] = await Promise.all([
    supabase.from("servicos").select("*").eq("empresa_id", e.id).eq("ativo", true).order("ordem"),
    supabase.from("veiculos").select("*").eq("cliente_id", cliente.id).order("criado_em"),
    supabase
      .from("assinaturas_cliente")
      .select("id, lavagens_usadas, mes_referencia, valido_ate, planos_cliente(servico_id, lavagens_mes, nome)")
      .eq("cliente_id", cliente.id)
      .eq("status", "ativa"),
  ]);

  const mesAtual = hojeISO().slice(0, 7);
  const planosDisponiveis = ((assinaturas ?? []) as unknown as {
    lavagens_usadas: number;
    mes_referencia: string;
    valido_ate: string | null;
    planos_cliente: { servico_id: string; lavagens_mes: number; nome: string } | null;
  }[])
    .filter((a) => a.planos_cliente && (!a.valido_ate || a.valido_ate >= hojeISO()))
    .map((a) => ({
      servicoId: a.planos_cliente!.servico_id,
      nome: a.planos_cliente!.nome,
      restantes: a.planos_cliente!.lavagens_mes - (a.mes_referencia === mesAtual ? a.lavagens_usadas : 0),
    }))
    .filter((p) => p.restantes > 0);

  return (
    <>
      {titulo}
      <FluxoAgendamento
        empresa={{
          id: e.id,
          slug,
          diasFuncionamento: e.dias_funcionamento,
          aceitaOnline: e.aceita_pagamento_online,
          fidelidadeAtiva: e.fidelidade_ativa,
          fidelidadeMeta: e.fidelidade_meta,
        }}
        cliente={{ id: cliente.id, selos: cliente.selos }}
        servicos={(servicos ?? []) as Servico[]}
        veiculos={(veiculos ?? []) as Veiculo[]}
        planos={planosDisponiveis}
        servicoInicial={typeof sp.servico === "string" ? sp.servico : undefined}
        hoje={hojeISO()}
      />
    </>
  );
}
