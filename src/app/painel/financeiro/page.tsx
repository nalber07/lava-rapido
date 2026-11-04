import Link from "next/link";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { exigirDono } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Cabecalho, Campo, Cartao, Entrada, Secao, Selecao, Vazio, cx } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { criarLancamento, excluirLancamento } from "../actions";
import { hojeISO, moeda, primeiraMaiuscula } from "@/lib/format";

const CATEGORIAS: Record<string, string> = {
  servicos: "Lavagens",
  produtos: "Produtos",
  planos: "Planos mensais",
  insumos: "Insumos e produtos de limpeza",
  aluguel: "Aluguel",
  salarios: "Salários e comissões",
  contas: "Água, luz e internet",
  impostos: "Impostos e taxas",
  equipamentos: "Equipamentos e manutenção",
  outros: "Outros",
};

function mesAnterior(m: string, delta: number) {
  const [a, mm] = m.split("-").map(Number);
  const d = new Date(Date.UTC(a, mm - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export default async function Financeiro({ searchParams }: PageProps<"/painel/financeiro">) {
  const { empresa } = await exigirDono();
  const sp = await searchParams;
  const mes = typeof sp.mes === "string" && /^\d{4}-\d{2}$/.test(sp.mes) ? sp.mes : hojeISO().slice(0, 7);
  const supabase = await createClient();
  const { data } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("empresa_id", empresa.id)
    .gte("data", `${mes}-01`)
    .lt("data", `${mesAnterior(mes, 1)}-01`)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  const lanc = data ?? [];
  const entradas = lanc.filter((l) => l.tipo === "entrada").reduce((t, l) => t + l.valor_centavos, 0);
  const saidas = lanc.filter((l) => l.tipo === "saida").reduce((t, l) => t + l.valor_centavos, 0);
  const porCategoria = (tipo: string) => {
    const m = new Map<string, number>();
    lanc.filter((l) => l.tipo === tipo).forEach((l) => m.set(l.categoria, (m.get(l.categoria) ?? 0) + l.valor_centavos));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${mes}-15T12:00:00Z`));

  return (
    <>
      <Cabecalho titulo="Financeiro" descricao="Lavagens, vendas e planos pagos entram sozinhos. Lance aqui as despesas." />

      <div className="mb-5 flex items-center justify-between rounded-xl bg-superficie p-1 shadow-cartao sm:inline-flex sm:gap-2">
        <Link href={`?mes=${mesAnterior(mes, -1)}`} className="grid size-10 place-items-center rounded-lg hover:bg-fundo" aria-label="Mês anterior">
          <ChevronLeft className="size-5" />
        </Link>
        <span className="px-2 font-medium">{primeiraMaiuscula(nomeMes)}</span>
        <Link href={`?mes=${mesAnterior(mes, 1)}`} className="grid size-10 place-items-center rounded-lg hover:bg-fundo" aria-label="Próximo mês">
          <ChevronRight className="size-5" />
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Cartao className="p-4">
          <p className="text-sm text-tinta-3">Entradas</p>
          <p className="mt-1 font-display text-xl tabular text-espuma-700">{moeda(entradas)}</p>
        </Cartao>
        <Cartao className="p-4">
          <p className="text-sm text-tinta-3">Saídas</p>
          <p className="mt-1 font-display text-xl tabular text-perigo">{moeda(saidas)}</p>
        </Cartao>
        <Cartao className="col-span-2 p-4 md:col-span-1">
          <p className="text-sm text-tinta-3">Resultado</p>
          <p className={cx("mt-1 font-display text-xl tabular", entradas - saidas < 0 && "text-perigo")}>
            {moeda(entradas - saidas)}
          </p>
        </Cartao>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Distribuicao titulo="De onde veio" itens={porCategoria("entrada")} total={entradas} cor="bg-espuma" />
            <Distribuicao titulo="Para onde foi" itens={porCategoria("saida")} total={saidas} cor="bg-perigo" />
          </div>

          <Secao titulo="Lançamentos">
            {lanc.length === 0 ? (
              <Vazio titulo="Nenhum lançamento neste mês" />
            ) : (
              <Cartao className="divide-y divide-borda overflow-hidden">
                {lanc.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-12 shrink-0 text-sm tabular text-tinta-3">
                      {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${l.data}T12:00:00Z`))}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.descricao}</p>
                      <p className="text-xs text-tinta-3">{CATEGORIAS[l.categoria] ?? l.categoria}</p>
                    </div>
                    <span className={cx("text-sm font-semibold tabular", l.tipo === "entrada" ? "text-espuma-700" : "text-perigo")}>
                      {l.tipo === "entrada" ? "+" : "−"}
                      {moeda(l.valor_centavos)}
                    </span>
                    <form action={excluirLancamento.bind(null, l.id)}>
                      <button className="grid size-8 place-items-center rounded-lg text-tinta-3 hover:bg-perigo-50 hover:text-perigo" aria-label="Excluir lançamento">
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </Cartao>
            )}
          </Secao>
        </div>

        <Secao titulo="Novo lançamento">
          <Cartao className="p-4">
            <Formulario acao={criarLancamento} limparAoSalvar className="space-y-3">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-fundo p-1 text-sm font-medium">
                <label className="cursor-pointer rounded-lg py-2 text-center has-[:checked]:bg-superficie has-[:checked]:text-perigo has-[:checked]:shadow-cartao">
                  <input type="radio" name="tipo" value="saida" defaultChecked className="sr-only" /> Despesa
                </label>
                <label className="cursor-pointer rounded-lg py-2 text-center has-[:checked]:bg-superficie has-[:checked]:text-espuma-700 has-[:checked]:shadow-cartao">
                  <input type="radio" name="tipo" value="entrada" className="sr-only" /> Receita
                </label>
              </div>
              <Campo rotulo="Valor (R$)">
                <Entrada name="valor" inputMode="decimal" required placeholder="0,00" />
              </Campo>
              <Campo rotulo="Descrição">
                <Entrada name="descricao" required placeholder="Ex.: Shampoo automotivo 5L" />
              </Campo>
              <Campo rotulo="Categoria">
                <Selecao name="categoria" defaultValue="insumos">
                  {Object.entries(CATEGORIAS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              <Campo rotulo="Data">
                <Entrada type="date" name="data" defaultValue={hojeISO()} />
              </Campo>
              <BotaoEnviar className="w-full">Lançar</BotaoEnviar>
            </Formulario>
          </Cartao>
        </Secao>
      </div>
    </>
  );
}

function Distribuicao({ titulo, itens, total, cor }: { titulo: string; itens: [string, number][]; total: number; cor: string }) {
  return (
    <Cartao className="mb-6 p-4">
      <p className="mb-3 text-sm font-medium text-tinta-2">{titulo}</p>
      {itens.length === 0 ? (
        <p className="text-sm text-tinta-3">Nada registrado.</p>
      ) : (
        <ul className="space-y-3">
          {itens.slice(0, 5).map(([cat, v]) => (
            <li key={cat}>
              <div className="flex justify-between text-sm">
                <span>{CATEGORIAS[cat] ?? cat}</span>
                <span className="tabular text-tinta-2">{moeda(v)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-fundo">
                <div className={cx("h-full rounded-full", cor)} style={{ width: `${Math.max(3, (v / total) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  );
}

