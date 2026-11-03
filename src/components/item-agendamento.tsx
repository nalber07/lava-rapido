import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Selo } from "@/components/ui";
import { hora, placaFormatada } from "@/lib/format";
import { STATUS_AGENDAMENTO, type StatusAgendamento } from "@/lib/types";

export type AgendamentoLista = {
  id: string;
  inicio: string;
  status: StatusAgendamento;
  servico_nome: string;
  status_pagamento: string;
  clientes: { nome: string } | null;
  veiculos: { placa: string; modelo: string | null; cor: string | null } | null;
};

export const SELECT_AGENDAMENTO =
  "id, inicio, status, servico_nome, status_pagamento, clientes(nome), veiculos(placa, modelo, cor)";

export function ItemAgendamento({ a }: { a: AgendamentoLista }) {
  const s = STATUS_AGENDAMENTO[a.status];
  return (
    <Link
      href={`/painel/agenda/${a.id}`}
      className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-fundo"
    >
      <div className="w-12 shrink-0 text-[15px] font-semibold tabular text-tinta">{hora(a.inicio)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-tinta">{a.clientes?.nome ?? "Cliente"}</p>
        <p className="truncate text-sm text-tinta-3">
          {a.servico_nome}
          {a.veiculos && ` · ${[a.veiculos.modelo, placaFormatada(a.veiculos.placa)].filter(Boolean).join(" ")}`}
        </p>
      </div>
      <Selo tom={s.tom}>{s.rotulo}</Selo>
      <ChevronRight className="size-4 shrink-0 text-tinta-3" aria-hidden />
    </Link>
  );
}
