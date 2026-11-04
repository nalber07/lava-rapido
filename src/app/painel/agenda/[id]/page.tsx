import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Car, MessageCircle, Phone } from "lucide-react";
import { exigirPainel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Botao, Cartao, Secao, Selecao, Selo, classeBotao } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { InputFotos } from "@/components/input-fotos";
import { BotaoEnviar } from "@/components/botao-enviar";
import { enviarFotos, mudarStatusAgendamento, registrarPagamento } from "../../actions";
import { dataLonga, hora, linkWhatsApp, moeda, placaFormatada } from "@/lib/format";
import { FORMA_PAGAMENTO, STATUS_AGENDAMENTO, type FormaPagamento, type StatusAgendamento } from "@/lib/types";

const FLUXO: { de: StatusAgendamento; para: StatusAgendamento; rotulo: string }[] = [
  { de: "agendado", para: "em_lavagem", rotulo: "Iniciar lavagem" },
  { de: "em_lavagem", para: "pronto", rotulo: "Marcar como pronto" },
  { de: "pronto", para: "entregue", rotulo: "Entregar ao cliente" },
];

export default async function DetalheAgendamento({ params }: PageProps<"/painel/agenda/[id]">) {
  const { id } = await params;
  const { empresa } = await exigirPainel();
  const supabase = await createClient();
  const { data: a } = await supabase
    .from("agendamentos")
    .select("*, clientes(id, nome, telefone, selos), veiculos(placa, modelo, cor, tipo)")
    .eq("id", id)
    .eq("empresa_id", empresa.id)
    .maybeSingle();
  if (!a) notFound();

  const status = a.status as StatusAgendamento;
  const s = STATUS_AGENDAMENTO[status];
  const proximo = FLUXO.find((f) => f.de === status);
  const cliente = a.clientes as { id: string; nome: string; telefone: string | null; selos: number } | null;
  const veiculo = a.veiculos as { placa: string; modelo: string | null; cor: string | null } | null;
  const nomeVeiculo = veiculo ? [veiculo.modelo, veiculo.cor].filter(Boolean).join(" ") || "seu veículo" : "seu veículo";
  const msgPronto = `Olá, ${cliente?.nome?.split(" ")[0] ?? ""}! Seu ${nomeVeiculo} está pronto para retirada no ${empresa.nome}. ${a.status_pagamento === "pago" ? "" : `Valor: ${moeda(a.valor_centavos)}. `}Obrigado!`;
  const pago = a.status_pagamento === "pago";

  return (
    <>
      <Link href={`/painel/agenda`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-tinta-2">
        <ArrowLeft className="size-4" aria-hidden /> Agenda
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-tinta-3">
            {dataLonga(a.inicio)} · {hora(a.inicio)} às {hora(a.fim)}
          </p>
          <h1 className="mt-1 font-display text-xl tracking-tight">{a.servico_nome}</h1>
        </div>
        <Selo tom={s.tom} className="text-sm">
          {s.rotulo}
        </Selo>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {proximo && (
            <form action={mudarStatusAgendamento.bind(null, a.id, proximo.para)}>
              <BotaoEnviar tamanho="lg" className="w-full" pendente="Atualizando…">
                {proximo.rotulo}
              </BotaoEnviar>
            </form>
          )}

          {(status === "pronto" || status === "em_lavagem") && cliente?.telefone && (
            <a href={linkWhatsApp(cliente.telefone, msgPronto)} target="_blank" className={classeBotao("secundario", "lg") + " w-full"}>
              <MessageCircle className="size-5 text-espuma" aria-hidden /> Avisar no WhatsApp que está pronto
            </a>
          )}

          <Cartao className="p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-agua-50 text-agua-700">
                <Car className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                {cliente ? (
                  <Link href={`/painel/clientes/${cliente.id}`} className="font-medium hover:underline">
                    {cliente.nome}
                  </Link>
                ) : (
                  <p className="font-medium">Cliente removido</p>
                )}
                {veiculo && (
                  <p className="text-sm text-tinta-3">
                    {[veiculo.modelo, veiculo.cor].filter(Boolean).join(" · ")} · <span className="font-mono">{placaFormatada(veiculo.placa)}</span>
                  </p>
                )}
                {a.observacoes && <p className="mt-2 rounded-lg bg-fundo px-3 py-2 text-sm">{a.observacoes}</p>}
              </div>
              {cliente?.telefone && (
                <a href={`tel:${cliente.telefone}`} className="grid size-10 place-items-center rounded-full text-tinta-2 hover:bg-fundo" aria-label="Ligar">
                  <Phone className="size-5" />
                </a>
              )}
            </div>
          </Cartao>

        </div>

        <div className="space-y-4">
          <Cartao className="p-4">
            <p className="text-sm text-tinta-3">Valor</p>
            <p className="font-display text-2xl tabular">{moeda(a.valor_centavos)}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Selo tom={pago ? "verde" : "ambar"}>{pago ? "Pago" : "A receber"}</Selo>
              <span className="text-tinta-3">{FORMA_PAGAMENTO[a.forma_pagamento as FormaPagamento]}</span>
            </div>
            {!pago && status !== "cancelado" && (
              <form action={registrarPagamento.bind(null, a.id)} className="mt-4 space-y-2">
                <Selecao name="forma" defaultValue="pix" aria-label="Forma de pagamento">
                  <option value="pix">Pix</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                </Selecao>
                <BotaoEnviar variante="secundario" className="w-full" pendente="Registrando…">
                  Registrar pagamento
                </BotaoEnviar>
              </form>
            )}
          </Cartao>

          {status === "agendado" && (
            <form action={mudarStatusAgendamento.bind(null, a.id, "cancelado")}>
              <Botao variante="perigo" className="w-full">
                Cancelar agendamento
              </Botao>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Secao titulo="Fotos">
          <div className="grid gap-4 sm:grid-cols-2">
            <Fotos id={a.id} tipo="antes" urls={a.fotos_antes ?? []} />
            <Fotos id={a.id} tipo="depois" urls={a.fotos_depois ?? []} />
          </div>
        </Secao>
      </div>
    </>
  );
}

function Fotos({ id, tipo, urls }: { id: string; tipo: "antes" | "depois"; urls: string[] }) {
  return (
    <Cartao className="p-4">
      <p className="mb-3 font-medium capitalize">{tipo}</p>
      {urls.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {urls.map((u) => (
            <a key={u} href={u} target="_blank" className="block aspect-square overflow-hidden rounded-lg bg-fundo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Foto ${tipo}`} className="size-full object-cover" loading="lazy" />
            </a>
          ))}
        </div>
      )}
      <Formulario acao={enviarFotos.bind(null, id, tipo)} limparAoSalvar className="space-y-2">
        <InputFotos name="fotos" rotulo="Tirar ou escolher fotos" />
        <BotaoEnviar variante="secundario" tamanho="sm" pendente="Enviando…">
          Enviar fotos
        </BotaoEnviar>
      </Formulario>
    </Cartao>
  );
}
