"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";
import { AreaTexto, Botao, Cartao, Entrada, Selecao, cx } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { adicionarVeiculo, agendar, buscarHorarios } from "../actions";
import { OFFSET, dataLonga, diaDoMes, diaSemanaCurto, hora, moeda, placaFormatada, somarDias } from "@/lib/format";
import type { FormaPagamento, Servico, Veiculo } from "@/lib/types";

type Props = {
  empresa: {
    id: string;
    slug: string;
    diasFuncionamento: number[];
    aceitaOnline: boolean;
    fidelidadeAtiva: boolean;
    fidelidadeMeta: number;
  };
  cliente: { id: string; selos: number };
  servicos: Servico[];
  veiculos: Veiculo[];
  planos: { servicoId: string; nome: string; restantes: number }[];
  servicoInicial?: string;
  hoje: string;
};

export function FluxoAgendamento({ empresa, cliente, servicos, veiculos, planos, servicoInicial, hoje }: Props) {
  const router = useRouter();
  const [servicoId, setServicoIdBruto] = useState(servicos.some((s) => s.id === servicoInicial) ? servicoInicial! : "");
  const [veiculoEscolhido, setVeiculoId] = useState(veiculos.length === 1 ? veiculos[0].id : "");
  const [dia, setDiaBruto] = useState("");
  const [cacheSlots, setCacheSlots] = useState<{ chave: string; lista: string[] } | null>(null);
  const [inicio, setInicio] = useState("");
  const [formaEscolhida, setForma] = useState<FormaPagamento | "">("");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, iniciarEnvio] = useTransition();
  // Quantos veículos havia quando o formulário de novo veículo foi aberto.
  const [abriuNovoCom, setAbriuNovoCom] = useState<number | null>(null);

  const servico = servicos.find((s) => s.id === servicoId);
  const plano = planos.find((p) => p.servicoId === servicoId);
  const podeFidelidade = empresa.fidelidadeAtiva && cliente.selos >= empresa.fidelidadeMeta;

  // Veículo: o escolhido, ou o último cadastrado.
  const veiculoId = veiculos.some((v) => v.id === veiculoEscolhido)
    ? veiculoEscolhido
    : veiculos.length > 0
      ? veiculos[veiculos.length - 1].id
      : "";
  const novoVeiculo = veiculos.length === 0 || abriuNovoCom === veiculos.length;
  const setNovoVeiculo = (v: boolean) => setAbriuNovoCom(v ? veiculos.length : null);

  function setServicoId(id: string) {
    setServicoIdBruto(id);
    setInicio("");
    setForma("");
  }
  function setDia(d: string) {
    setDiaBruto(d);
    setInicio("");
  }

  const dias = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => somarDias(hoje, i)).filter((d) =>
        empresa.diasFuncionamento.includes(new Date(`${d}T12:00:00${OFFSET}`).getUTCDay()),
      ),
    [hoje, empresa.diasFuncionamento],
  );

  const chaveSlots = dia && servicoId ? `${dia}|${servicoId}` : "";
  const slots = cacheSlots && cacheSlots.chave === chaveSlots ? cacheSlots.lista : null;
  const carregandoSlots = Boolean(chaveSlots) && slots === null;

  useEffect(() => {
    if (!chaveSlots) return;
    let ativo = true;
    const [d, s] = chaveSlots.split("|");
    buscarHorarios(empresa.id, d, s).then((lista) => {
      if (ativo) setCacheSlots({ chave: chaveSlots, lista });
    });
    return () => {
      ativo = false;
    };
  }, [chaveSlots, empresa.id]);

  // Forma de pagamento: a escolhida, se ainda valer; senão a melhor disponível.
  const formasValidas: FormaPagamento[] = [
    ...(plano ? (["plano"] as const) : []),
    ...(podeFidelidade ? (["fidelidade"] as const) : []),
    ...(empresa.aceitaOnline ? (["pix", "cartao"] as const) : []),
    "no_local",
  ];
  const forma: FormaPagamento = formaEscolhida && formasValidas.includes(formaEscolhida) ? formaEscolhida : formasValidas[0];

  const pronto = servico && veiculoId && inicio && forma;
  const valor = forma === "plano" || forma === "fidelidade" ? 0 : servico?.preco_centavos ?? 0;

  function confirmar() {
    if (!pronto) return;
    setErro("");
    iniciarEnvio(async () => {
      const r = await agendar({
        empresaId: empresa.id,
        slug: empresa.slug,
        veiculoId,
        servicoId,
        inicio,
        forma,
        observacoes: obs,
      });
      if (!r.ok) {
        setErro(r.mensagem);
        if (r.mensagem.includes("horário")) {
          setInicio("");
          setCacheSlots({ chave: chaveSlots, lista: await buscarHorarios(empresa.id, dia, servicoId) });
        }
        return;
      }
      if (r.redirecionar.startsWith("http")) window.location.href = r.redirecionar;
      else router.push(r.redirecionar);
    });
  }

  return (
    <div className="space-y-7 pb-32">
      <Etapa n={1} titulo="Serviço" feito={!!servico}>
        <div className="grid gap-2">
          {servicos.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setServicoId(s.id)}
              aria-pressed={servicoId === s.id}
              className={cx(
                "flex items-center gap-3 rounded-cartao border bg-superficie px-4 py-3.5 text-left transition-colors",
                servicoId === s.id ? "border-agua-600 ring-1 ring-agua-600" : "border-borda hover:border-borda-forte",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.nome}</p>
                <p className="text-sm text-tinta-3">
                  {s.duracao_minutos} min{s.descricao && ` · ${s.descricao}`}
                </p>
              </div>
              <span className="font-semibold tabular">{moeda(s.preco_centavos)}</span>
            </button>
          ))}
        </div>
      </Etapa>

      <Etapa n={2} titulo="Veículo" feito={!!veiculoId}>
        <div className="flex flex-wrap gap-2">
          {veiculos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVeiculoId(v.id)}
              aria-pressed={veiculoId === v.id}
              className={cx(
                "rounded-xl border bg-superficie px-3.5 py-2.5 text-left text-sm",
                veiculoId === v.id ? "border-agua-600 ring-1 ring-agua-600" : "border-borda",
              )}
            >
              <span className="block font-mono font-semibold">{placaFormatada(v.placa)}</span>
              <span className="text-tinta-3">{[v.modelo, v.cor].filter(Boolean).join(" · ") || v.tipo}</span>
            </button>
          ))}
          {!novoVeiculo && (
            <button
              type="button"
              onClick={() => setNovoVeiculo(true)}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-borda-forte px-3.5 py-2.5 text-sm font-medium text-agua-700"
            >
              <Plus className="size-4" aria-hidden /> Outro veículo
            </button>
          )}
        </div>
        {novoVeiculo && (
          <Cartao className="mt-3 p-4">
            <Formulario acao={adicionarVeiculo.bind(null, empresa.id, cliente.id, empresa.slug)} limparAoSalvar className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Entrada name="placa" placeholder="Placa" className="uppercase" required aria-label="Placa" autoCapitalize="characters" />
                <Selecao name="tipo" defaultValue="carro" aria-label="Tipo">
                  <option value="carro">Carro</option>
                  <option value="suv">SUV</option>
                  <option value="caminhonete">Caminhonete</option>
                  <option value="moto">Moto</option>
                  <option value="van">Van</option>
                </Selecao>
                <Entrada name="modelo" placeholder="Modelo (ex.: Onix)" aria-label="Modelo" />
                <Entrada name="cor" placeholder="Cor" aria-label="Cor" />
              </div>
              <BotaoEnviar variante="secundario" tamanho="sm">
                Salvar veículo
              </BotaoEnviar>
            </Formulario>
          </Cartao>
        )}
      </Etapa>

      <Etapa n={3} titulo="Dia" feito={!!dia}>
        <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {dias.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDia(d)}
              aria-pressed={dia === d}
              disabled={!servicoId}
              className={cx(
                "flex w-16 shrink-0 snap-start flex-col items-center rounded-xl border py-2.5 disabled:opacity-40",
                dia === d ? "border-agua-600 bg-agua-600 text-white" : "border-borda bg-superficie",
              )}
            >
              <span className={cx("text-xs capitalize", dia === d ? "text-agua-100" : "text-tinta-3")}>
                {d === hoje ? "Hoje" : diaSemanaCurto(d)}
              </span>
              <span className="text-lg font-semibold tabular">{diaDoMes(d)}</span>
            </button>
          ))}
        </div>
        {!servicoId && <p className="mt-2 text-sm text-tinta-3">Escolha o serviço primeiro.</p>}
      </Etapa>

      <Etapa n={4} titulo="Horário" feito={!!inicio}>
        {!dia ? (
          <p className="text-sm text-tinta-3">Escolha o dia para ver os horários livres.</p>
        ) : carregandoSlots || slots === null ? (
          <p className="flex items-center gap-2 text-sm text-tinta-3">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Buscando horários…
          </p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-tinta-3">Sem horários livres nesse dia. Tente outro.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInicio(s)}
                aria-pressed={inicio === s}
                className={cx(
                  "rounded-xl border py-2.5 text-[15px] font-medium tabular",
                  inicio === s ? "border-agua-600 bg-agua-600 text-white" : "border-borda bg-superficie hover:border-borda-forte",
                )}
              >
                {hora(s)}
              </button>
            ))}
          </div>
        )}
      </Etapa>

      <Etapa n={5} titulo="Pagamento" feito={!!forma}>
        <div className="grid gap-2">
          {plano && (
            <OpcaoPagamento valor="plano" atual={forma} onChange={setForma} titulo={`Usar meu plano (${plano.restantes} restante${plano.restantes > 1 ? "s" : ""})`} detalhe={plano.nome} />
          )}
          {podeFidelidade && (
            <OpcaoPagamento valor="fidelidade" atual={forma} onChange={setForma} titulo="Lavagem grátis do cartão fidelidade" detalhe={`Usa ${empresa.fidelidadeMeta} dos seus ${cliente.selos} selos`} />
          )}
          {empresa.aceitaOnline && (
            <>
              <OpcaoPagamento valor="pix" atual={forma} onChange={setForma} titulo="Pix agora" detalhe="Aprovação na hora pelo Mercado Pago" />
              <OpcaoPagamento valor="cartao" atual={forma} onChange={setForma} titulo="Cartão agora" detalhe="Crédito ou débito pelo Mercado Pago" />
            </>
          )}
          <OpcaoPagamento valor="no_local" atual={forma} onChange={setForma} titulo="Pagar no local" detalhe="Pix, cartão ou dinheiro na retirada" />
        </div>
        <AreaTexto
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Alguma observação? (opcional)"
          rows={2}
          className="mt-3"
          aria-label="Observações"
        />
      </Etapa>

      <div className="pb-seguro fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-superficie px-4 pt-3 shadow-flutuante">
        <div className="mx-auto max-w-3xl">
          {erro && <p className="mb-2 rounded-lg bg-perigo-50 px-3 py-2 text-sm text-perigo">{erro}</p>}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 text-sm">
              {pronto ? (
                <>
                  <p className="truncate font-medium">
                    {dataLonga(inicio)}, {hora(inicio)}
                  </p>
                  <p className="truncate text-tinta-3">
                    {servico?.nome} · <span className="tabular">{moeda(valor)}</span>
                  </p>
                </>
              ) : (
                <p className="text-tinta-3">Preencha as etapas acima</p>
              )}
            </div>
            <Botao onClick={confirmar} disabled={!pronto || enviando} tamanho="lg" aria-busy={enviando}>
              {enviando ? "Agendando…" : forma === "pix" || forma === "cartao" ? "Ir para pagamento" : "Confirmar"}
            </Botao>
          </div>
        </div>
      </div>
    </div>
  );
}

function Etapa({ n, titulo, feito, children }: { n: number; titulo: string; feito: boolean; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2.5 font-semibold">
        <span
          className={cx(
            "grid size-6 place-items-center rounded-full text-xs tabular",
            feito ? "bg-espuma text-white" : "bg-borda text-tinta-2",
          )}
          aria-hidden
        >
          {feito ? <Check className="size-3.5" strokeWidth={3} /> : n}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function OpcaoPagamento({
  valor,
  atual,
  onChange,
  titulo,
  detalhe,
}: {
  valor: FormaPagamento;
  atual: string;
  onChange: (f: FormaPagamento) => void;
  titulo: string;
  detalhe: string;
}) {
  const on = atual === valor;
  return (
    <label
      className={cx(
        "flex cursor-pointer items-center gap-3 rounded-cartao border bg-superficie px-4 py-3",
        on ? "border-agua-600 ring-1 ring-agua-600" : "border-borda",
      )}
    >
      <input type="radio" name="forma" checked={on} onChange={() => onChange(valor)} className="size-4 accent-agua-600" />
      <span>
        <span className="block font-medium">{titulo}</span>
        <span className="text-sm text-tinta-3">{detalhe}</span>
      </span>
    </label>
  );
}
