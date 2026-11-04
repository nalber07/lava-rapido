import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { exigirPainel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BotaoLink, Cabecalho, Cartao, Secao, Vazio } from "@/components/ui";
import { CopiarLink } from "@/components/copiar-link";
import { ItemAgendamento, SELECT_AGENDAMENTO, type AgendamentoLista } from "@/components/item-agendamento";
import { dataLonga, hojeISO, inicioDoDia, moeda, somarDias } from "@/lib/format";

export default async function Inicio() {
  const { empresa, papel } = await exigirPainel();
  const supabase = await createClient();
  const hoje = hojeISO();
  const mes = `${hoje.slice(0, 7)}-01`;

  const [agenda, lancHoje, lancMes, pedidos, assinaturas] = await Promise.all([
    supabase
      .from("agendamentos")
      .select(SELECT_AGENDAMENTO)
      .eq("empresa_id", empresa.id)
      .gte("inicio", inicioDoDia(hoje))
      .lt("inicio", inicioDoDia(somarDias(hoje, 1)))
      .neq("status", "cancelado")
      .order("inicio"),
    papel === "dono"
      ? supabase.from("lancamentos").select("tipo, valor_centavos").eq("empresa_id", empresa.id).eq("data", hoje)
      : Promise.resolve({ data: [] }),
    papel === "dono"
      ? supabase.from("lancamentos").select("tipo, valor_centavos").eq("empresa_id", empresa.id).gte("data", mes)
      : Promise.resolve({ data: [] }),
    supabase.from("pedidos").select("id", { count: "exact", head: true }).eq("empresa_id", empresa.id).in("status", ["aberto", "pronto"]),
    supabase.from("assinaturas_cliente").select("id", { count: "exact", head: true }).eq("empresa_id", empresa.id).eq("status", "pendente"),
  ]);

  const lista = (agenda.data ?? []) as unknown as AgendamentoLista[];
  const soma = (rows: { tipo: string; valor_centavos: number }[] | null) =>
    (rows ?? []).reduce((t, r) => t + (r.tipo === "entrada" ? r.valor_centavos : -r.valor_centavos), 0);
  const entradasHoje = (lancHoje.data ?? []).filter((r) => r.tipo === "entrada").reduce((t, r) => t + r.valor_centavos, 0);

  const emAndamento = lista.filter((a) => a.status === "em_lavagem" || a.status === "pronto").length;
  const restantes = lista.filter((a) => a.status === "agendado").length;

  return (
    <>
      <Cabecalho
        titulo="Hoje"
        descricao={<span>{dataLonga(new Date())}</span>}
        acao={
          <BotaoLink href="/painel/agenda/novo" tamanho="sm" aria-label="Novo agendamento">
            <CalendarPlus className="size-4" aria-hidden /> <span className="hidden sm:inline">Agendar</span>
          </BotaoLink>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador rotulo="Carros hoje" valor={String(lista.length)} detalhe={`${restantes} a chegar`} />
        <Indicador rotulo="No pátio" valor={String(emAndamento)} detalhe="lavando ou prontos" />
        {papel === "dono" ? (
          <>
            <Indicador rotulo="Recebido hoje" valor={moeda(entradasHoje)} />
            <Indicador rotulo="Saldo do mês" valor={moeda(soma(lancMes.data as never))} />
          </>
        ) : (
          <Indicador rotulo="Pedidos a separar" valor={String(pedidos.count ?? 0)} />
        )}
      </div>

      {((pedidos.count ?? 0) > 0 || (assinaturas.count ?? 0) > 0) && (
        <div className="mb-8 flex flex-col gap-2 sm:flex-row">
          {(pedidos.count ?? 0) > 0 && (
            <Link href="/painel/pedidos" className="flex-1 rounded-xl bg-agua-50 px-4 py-3 text-sm font-medium text-agua-700">
              {pedidos.count === 1 ? "1 pedido da loja para separar" : `${pedidos.count} pedidos da loja para separar`} →
            </Link>
          )}
          {(assinaturas.count ?? 0) > 0 && (
            <Link href="/painel/fidelidade" className="flex-1 rounded-xl bg-ambar-50 px-4 py-3 text-sm font-medium text-ambar-700">
              {assinaturas.count === 1 ? "1 plano mensal aguardando pagamento" : `${assinaturas.count} planos mensais aguardando pagamento`} →
            </Link>
          )}
        </div>
      )}

      <Secao titulo="Agenda de hoje" acao={<Link href="/painel/agenda" className="text-sm font-medium text-agua-700">Ver agenda</Link>}>
        {lista.length === 0 ? (
          <Vazio
            titulo="Nenhum carro agendado para hoje"
            texto="Compartilhe a página do seu lava rápido para os clientes agendarem sozinhos."
            acao={<CopiarLink caminho={`/l/${empresa.slug}`} titulo={empresa.nome} />}
          />
        ) : (
          <Cartao className="divide-y divide-borda overflow-hidden">
            {lista.map((a) => (
              <ItemAgendamento key={a.id} a={a} />
            ))}
          </Cartao>
        )}
      </Secao>

      <Cartao className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Página de agendamento</p>
          <p className="text-sm text-tinta-3">/l/{empresa.slug}</p>
        </div>
        <div className="flex gap-2">
          <BotaoLink href={`/l/${empresa.slug}`} target="_blank" variante="fantasma" tamanho="sm">
            Abrir
          </BotaoLink>
          <CopiarLink caminho={`/l/${empresa.slug}`} titulo={empresa.nome} />
        </div>
      </Cartao>
    </>
  );
}

function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <Cartao className="p-4">
      <p className="text-sm text-tinta-3">{rotulo}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular tracking-tight">{valor}</p>
      {detalhe && <p className="mt-0.5 text-xs text-tinta-3">{detalhe}</p>}
    </Cartao>
  );
}
