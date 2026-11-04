import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { exigirPainel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BotaoLink, Cabecalho, Cartao, Vazio, cx } from "@/components/ui";
import { ItemAgendamento, SELECT_AGENDAMENTO, type AgendamentoLista } from "@/components/item-agendamento";
import { dataLonga, diaDoMes, diaSemanaCurto, hojeISO, inicioDoDia, OFFSET, somarDias } from "@/lib/format";

export default async function Agenda({ searchParams }: PageProps<"/painel/agenda">) {
  const { empresa } = await exigirPainel();
  const sp = await searchParams;
  const hoje = hojeISO();
  const dia = typeof sp.dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.dia) ? sp.dia : hoje;
  const mostrarCancelados = sp.cancelados === "1";

  const supabase = await createClient();
  let q = supabase
    .from("agendamentos")
    .select(SELECT_AGENDAMENTO)
    .eq("empresa_id", empresa.id)
    .gte("inicio", inicioDoDia(dia))
    .lt("inicio", inicioDoDia(somarDias(dia, 1)))
    .order("inicio");
  if (!mostrarCancelados) q = q.neq("status", "cancelado");
  const { data } = await q;
  const lista = (data ?? []) as unknown as AgendamentoLista[];

  const semana = Array.from({ length: 7 }, (_, i) => somarDias(dia, i - 3));
  const fechado = !empresa.dias_funcionamento.includes(new Date(`${dia}T12:00:00${OFFSET}`).getUTCDay());

  return (
    <>
      <Cabecalho
        titulo="Agenda"
        descricao={<span>{dataLonga(`${dia}T12:00:00${OFFSET}`)}</span>}
        acao={
          <BotaoLink href={`/painel/agenda/novo?dia=${dia}`} tamanho="sm" aria-label="Novo agendamento">
            <CalendarPlus className="size-4" aria-hidden /> <span className="hidden sm:inline">Novo agendamento</span>
          </BotaoLink>
        }
      />

      <div className="mb-5 flex items-center gap-1">
        <Link href={`?dia=${somarDias(dia, -7)}`} className="grid size-10 shrink-0 place-items-center rounded-xl text-tinta-2 hover:bg-superficie" aria-label="Semana anterior">
          <ChevronLeft className="size-5" />
        </Link>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {semana.map((d) => (
            <Link
              key={d}
              href={`?dia=${d}`}
              className={cx(
                "flex flex-col items-center rounded-xl py-2 text-xs",
                d === dia ? "bg-acao text-sobre-acao font-semibold" : "text-tinta-2 hover:bg-superficie",
              )}
              aria-current={d === dia ? "date" : undefined}
            >
              <span className="capitalize">{diaSemanaCurto(d)}</span>
              <span className={cx("mt-0.5 text-base font-semibold tabular", d === hoje && d !== dia && "text-agua-600")}>
                {diaDoMes(d)}
              </span>
            </Link>
          ))}
        </div>
        <Link href={`?dia=${somarDias(dia, 7)}`} className="grid size-10 shrink-0 place-items-center rounded-xl text-tinta-2 hover:bg-superficie" aria-label="Próxima semana">
          <ChevronRight className="size-5" />
        </Link>
      </div>

      {lista.length === 0 ? (
        <Vazio
          titulo={fechado ? "Fechado neste dia" : "Nenhum agendamento"}
          texto={fechado ? "Altere os dias de funcionamento em Configurações." : "Os agendamentos feitos pelos clientes aparecem aqui."}
        />
      ) : (
        <Cartao className="divide-y divide-borda overflow-hidden">
          {lista.map((a) => (
            <ItemAgendamento key={a.id} a={a} />
          ))}
        </Cartao>
      )}

      <div className="mt-4 text-center">
        <Link href={`?dia=${dia}${mostrarCancelados ? "" : "&cancelados=1"}`} className="text-sm text-tinta-3 hover:text-tinta">
          {mostrarCancelados ? "Esconder cancelados" : "Mostrar cancelados"}
        </Link>
      </div>
    </>
  );
}
