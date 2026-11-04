import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { getClienteAtual, getEmpresaPorSlug } from "@/lib/vitrine";
import { createClient } from "@/lib/supabase/server";
import { Aviso, BotaoLink, Cartao, Secao, Selo, Vazio, cx } from "@/components/ui";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Formulario } from "@/components/formulario";
import { Entrada, Selecao } from "@/components/ui";
import { AtualizarSozinho } from "@/components/atualizar-sozinho";
import { CompletarCadastro, PedirLogin } from "../acesso";
import { adicionarVeiculo, assinarPlano, cancelarMeuAgendamento, pagarAgendamento, removerVeiculo } from "../actions";
import { dataHora, dataLonga, hora, moeda, placaFormatada } from "@/lib/format";
import { FORMA_PAGAMENTO, STATUS_AGENDAMENTO, STATUS_PEDIDO, type FormaPagamento, type StatusAgendamento, type StatusPedido } from "@/lib/types";

export const metadata: Metadata = { title: "Minha conta" };

const PASSOS: StatusAgendamento[] = ["agendado", "em_lavagem", "pronto", "entregue"];

export default async function Conta({ params, searchParams }: PageProps<"/l/[slug]/conta">) {
  const { slug } = await params;
  const sp = await searchParams;
  const e = await getEmpresaPorSlug(slug);
  const { user, cliente } = await getClienteAtual(e.id);
  const assinarId = typeof sp.assinar === "string" ? sp.assinar : null;
  const destino = `/l/${slug}/conta${assinarId ? `?assinar=${assinarId}` : ""}`;

  if (!user) {
    return (
      <>
        <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight">Minha conta</h1>
        <PedirLogin slug={slug} destino={destino} texto="Veja seus agendamentos, selos de fidelidade e compras." />
      </>
    );
  }
  if (!cliente) {
    const meta = user.user_metadata as Record<string, string>;
    return (
      <>
        <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight">Minha conta</h1>
        <CompletarCadastro empresaId={e.id} slug={slug} nome={meta?.nome} telefone={meta?.telefone} />
      </>
    );
  }

  const supabase = await createClient();
  const [{ data: proximos }, { data: historico }, { data: veiculos }, { data: assinaturas }, { data: pedidos }, { data: planoEscolhido }] =
    await Promise.all([
      supabase
        .from("agendamentos")
        .select("*, veiculos(placa, modelo)")
        .eq("cliente_id", cliente.id)
        .in("status", ["agendado", "em_lavagem", "pronto"])
        .order("inicio"),
      supabase
        .from("agendamentos")
        .select("id, inicio, servico_nome, valor_centavos, status, fotos_antes, fotos_depois")
        .eq("cliente_id", cliente.id)
        .in("status", ["entregue", "cancelado"])
        .order("inicio", { ascending: false })
        .limit(10),
      supabase.from("veiculos").select("*").eq("cliente_id", cliente.id).order("criado_em"),
      supabase
        .from("assinaturas_cliente")
        .select("id, status, valido_ate, lavagens_usadas, planos_cliente(nome, lavagens_mes, preco_centavos)")
        .eq("cliente_id", cliente.id)
        .neq("status", "cancelada"),
      supabase
        .from("pedidos")
        .select("id, criado_em, status, total_centavos, status_pagamento")
        .eq("cliente_id", cliente.id)
        .order("criado_em", { ascending: false })
        .limit(5),
      assinarId
        ? supabase.from("planos_cliente").select("*, servicos(nome)").eq("id", assinarId).eq("empresa_id", e.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const temAtivos = (proximos ?? []).some((a) => a.status !== "agendado");

  return (
    <>
      {temAtivos && <AtualizarSozinho segundos={20} />}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Olá, {cliente.nome.split(" ")[0]}</h1>
          <p className="text-sm text-tinta-3">{user.email}</p>
        </div>
        <form action="/sair" method="post">
          <input type="hidden" name="next" value={`/l/${slug}`} />
          <button className="text-sm text-tinta-3 hover:text-tinta">Sair</button>
        </form>
      </div>

      <div className="mb-6 space-y-2">
        {sp.agendado && <Aviso tom="verde">Agendamento confirmado! Te esperamos.</Aviso>}
        {sp.pedido && <Aviso tom="verde">Pedido recebido! Retire no lava rápido.</Aviso>}
        {sp.plano && <Aviso tom="verde">Pedido de plano enviado. Ele é ativado assim que o pagamento for confirmado.</Aviso>}
        {sp.pagamento && <Aviso tom="azul">Voltamos do Mercado Pago. A confirmação do pagamento aparece aqui em instantes.</Aviso>}
        {sp.falhaPagamento && <Aviso tom="ambar">Não conseguimos abrir o pagamento online agora. Você pode pagar no local.</Aviso>}
        {typeof sp.erro === "string" && <Aviso tom="vermelho">{sp.erro}</Aviso>}
      </div>

      {planoEscolhido && (
        <Cartao className="mb-6 border-agua-600 p-4 ring-1 ring-agua-600">
          <p className="text-sm text-tinta-3">Assinar plano</p>
          <p className="font-display text-xl font-semibold">{planoEscolhido.nome}</p>
          <p className="text-sm text-tinta-2">
            {planoEscolhido.lavagens_mes}× {(planoEscolhido.servicos as { nome: string } | null)?.nome} por mês ·{" "}
            <strong className="tabular">{moeda(planoEscolhido.preco_centavos)}/mês</strong>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {e.aceita_pagamento_online && (
              <form action={assinarPlano.bind(null, planoEscolhido.id, slug, true)} className="flex-1">
                <BotaoEnviar className="w-full" pendente="Abrindo…">
                  Pagar 1º mês agora
                </BotaoEnviar>
              </form>
            )}
            <form action={assinarPlano.bind(null, planoEscolhido.id, slug, false)} className="flex-1">
              <BotaoEnviar className="w-full" variante={e.aceita_pagamento_online ? "secundario" : "primario"} pendente="Enviando…">
                Pagar no lava rápido
              </BotaoEnviar>
            </form>
          </div>
        </Cartao>
      )}

      <Secao titulo="Próximas lavagens">
        {(proximos ?? []).length === 0 ? (
          <Vazio titulo="Nenhuma lavagem agendada" acao={<BotaoLink href={`/l/${slug}/agendar`}>Agendar agora</BotaoLink>} />
        ) : (
          <div className="space-y-3">
            {(proximos ?? []).map((a) => {
              const status = a.status as StatusAgendamento;
              const passo = PASSOS.indexOf(status);
              const v = a.veiculos as { placa: string; modelo: string | null } | null;
              const pendenteOnline = a.status_pagamento === "pendente" && ["pix", "cartao"].includes(a.forma_pagamento) && e.aceita_pagamento_online;
              return (
                <Cartao key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {dataLonga(a.inicio)}, {hora(a.inicio)}
                      </p>
                      <p className="text-sm text-tinta-3">
                        {a.servico_nome}
                        {v && ` · ${[v.modelo, placaFormatada(v.placa)].filter(Boolean).join(" ")}`}
                      </p>
                    </div>
                    <Selo tom={STATUS_AGENDAMENTO[status].tom}>{STATUS_AGENDAMENTO[status].rotulo}</Selo>
                  </div>
                  <ol className="mt-4 grid grid-cols-4 gap-1" aria-label="Andamento">
                    {PASSOS.map((p, i) => (
                      <li key={p} className="text-center">
                        <div className={cx("h-1.5 rounded-full", i <= passo ? "bg-agua-600" : "bg-borda")} />
                        <span className={cx("mt-1 block text-[11px]", i === passo ? "font-semibold text-agua-700" : "text-tinta-3")}>
                          {STATUS_AGENDAMENTO[p].rotulo}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {status === "pronto" && <p className="mt-3 rounded-lg bg-espuma-50 px-3 py-2 text-sm text-espuma-700">Seu carro está pronto para retirada!</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-borda pt-3 text-sm">
                    <span className="flex-1">
                      <span className="font-semibold tabular">{moeda(a.valor_centavos)}</span>{" "}
                      <span className={a.status_pagamento === "pago" ? "text-espuma-700" : "text-tinta-3"}>
                        · {a.status_pagamento === "pago" ? "Pago" : FORMA_PAGAMENTO[a.forma_pagamento as FormaPagamento]}
                      </span>
                    </span>
                    {pendenteOnline && (
                      <form action={pagarAgendamento.bind(null, a.id, slug)}>
                        <BotaoEnviar tamanho="sm" pendente="Abrindo…">
                          Pagar agora
                        </BotaoEnviar>
                      </form>
                    )}
                    {status === "agendado" && (
                      <form action={cancelarMeuAgendamento.bind(null, a.id, slug)}>
                        <BotaoEnviar tamanho="sm" variante="fantasma" pendente="Cancelando…">
                          Cancelar
                        </BotaoEnviar>
                      </form>
                    )}
                  </div>
                </Cartao>
              );
            })}
          </div>
        )}
      </Secao>

      {e.fidelidade_ativa && (
        <Secao titulo="Cartão fidelidade">
          <div className="rounded-cartao bg-agua-900 p-4 text-white">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl font-semibold tabular">
                {Math.min(cliente.selos, e.fidelidade_meta)}/{e.fidelidade_meta}
              </p>
              <p className="text-sm text-agua-200">
                {cliente.selos >= e.fidelidade_meta ? "Você ganhou uma lavagem grátis!" : `Faltam ${e.fidelidade_meta - cliente.selos} para a grátis`}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-10 gap-1.5" aria-hidden>
              {Array.from({ length: e.fidelidade_meta }, (_, i) => (
                <span key={i} className={cx("aspect-square rounded-full border-2", i < cliente.selos ? "border-agua-200 bg-agua-200" : "border-agua-700")} />
              ))}
            </div>
          </div>
        </Secao>
      )}

      {(assinaturas ?? []).length > 0 && (
        <Secao titulo="Meus planos">
          <Cartao className="divide-y divide-borda">
            {((assinaturas ?? []) as unknown as { id: string; status: string; valido_ate: string | null; lavagens_usadas: number; planos_cliente: { nome: string; lavagens_mes: number; preco_centavos: number } | null }[]).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">{a.planos_cliente?.nome}</p>
                  <p className="text-sm text-tinta-3">
                    {a.status === "ativa"
                      ? `${a.lavagens_usadas} de ${a.planos_cliente?.lavagens_mes} lavagens usadas este mês`
                      : "Aguardando confirmação do pagamento"}
                  </p>
                </div>
                <Selo tom={a.status === "ativa" ? "verde" : "ambar"}>{a.status === "ativa" ? "Ativo" : "Pendente"}</Selo>
              </div>
            ))}
          </Cartao>
        </Secao>
      )}

      <Secao titulo="Meus veículos">
        <Cartao className="divide-y divide-borda">
          {(veiculos ?? []).map((v) => (
            <div key={v.id} className="flex items-center gap-3 px-4 py-3">
              <span className="rounded-md border border-tinta/20 bg-fundo px-2 py-1 font-mono text-sm font-semibold">{placaFormatada(v.placa)}</span>
              <span className="flex-1 text-sm text-tinta-2">{[v.modelo, v.cor].filter(Boolean).join(" · ")}</span>
              <form action={removerVeiculo.bind(null, v.id, slug)}>
                <button className="grid size-9 place-items-center rounded-lg text-tinta-3 hover:bg-perigo-50 hover:text-perigo" aria-label="Remover veículo">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          ))}
          <Formulario acao={adicionarVeiculo.bind(null, e.id, cliente.id, slug)} limparAoSalvar className="space-y-2 p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Entrada name="placa" placeholder="Placa" className="uppercase" required aria-label="Placa" />
              <Entrada name="modelo" placeholder="Modelo" aria-label="Modelo" />
              <Entrada name="cor" placeholder="Cor" aria-label="Cor" />
              <Selecao name="tipo" defaultValue="carro" aria-label="Tipo">
                <option value="carro">Carro</option>
                <option value="suv">SUV</option>
                <option value="caminhonete">Caminhonete</option>
                <option value="moto">Moto</option>
                <option value="van">Van</option>
              </Selecao>
            </div>
            <BotaoEnviar variante="secundario" tamanho="sm">
              Adicionar veículo
            </BotaoEnviar>
          </Formulario>
        </Cartao>
      </Secao>

      {(pedidos ?? []).length > 0 && (
        <Secao titulo="Minhas compras">
          <Cartao className="divide-y divide-borda">
            {(pedidos ?? []).map((p) => {
              const s = STATUS_PEDIDO[p.status as StatusPedido];
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="flex-1 text-tinta-3">{dataHora(p.criado_em)}</span>
                  <span className="font-semibold tabular">{moeda(p.total_centavos)}</span>
                  <Selo tom={s.tom}>{s.rotulo}</Selo>
                </div>
              );
            })}
          </Cartao>
        </Secao>
      )}

      {(historico ?? []).length > 0 && (
        <Secao titulo="Histórico">
          <div className="space-y-3">
            {(historico ?? []).map((h) => (
              <Cartao key={h.id} className="p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-tinta-3">{dataHora(h.inicio)}</span>
                  <Selo tom={STATUS_AGENDAMENTO[h.status as StatusAgendamento].tom}>{STATUS_AGENDAMENTO[h.status as StatusAgendamento].rotulo}</Selo>
                </div>
                <p className="mt-1 font-medium">
                  {h.servico_nome} · <span className="tabular">{moeda(h.valor_centavos)}</span>
                </p>
                {(h.fotos_antes.length > 0 || h.fotos_depois.length > 0) && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(["antes", "depois"] as const).map((t) => {
                      const fotos = t === "antes" ? h.fotos_antes : h.fotos_depois;
                      return (
                        <div key={t}>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-tinta-3">{t}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {fotos.slice(0, 4).map((u: string) => (
                              <a key={u} href={u} target="_blank" className="block aspect-square overflow-hidden rounded-lg bg-fundo">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={u} alt={`Foto ${t}`} className="size-full object-cover" loading="lazy" />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Cartao>
            ))}
          </div>
        </Secao>
      )}
    </>
  );
}
