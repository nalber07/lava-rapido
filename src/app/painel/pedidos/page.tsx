import Link from "next/link";
import { exigirPainel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Cabecalho, Cartao, Selo, Vazio, cx } from "@/components/ui";
import { BotaoEnviar } from "@/components/botao-enviar";
import { mudarStatusPedido, registrarPagamentoPedido } from "../actions";
import { dataHora, moeda } from "@/lib/format";
import { FORMA_PAGAMENTO, STATUS_PEDIDO, type FormaPagamento, type StatusPedido } from "@/lib/types";

export default async function Pedidos({ searchParams }: PageProps<"/painel/pedidos">) {
  const { empresa } = await exigirPainel();
  const sp = await searchParams;
  const aba = sp.aba === "historico" ? "historico" : "abertos";
  const supabase = await createClient();
  const { data } = await supabase
    .from("pedidos")
    .select("*, clientes(id, nome), itens_pedido(produto_nome, quantidade, preco_unit_centavos)")
    .eq("empresa_id", empresa.id)
    .in("status", aba === "abertos" ? ["aberto", "pronto"] : ["retirado", "cancelado"])
    .order("criado_em", { ascending: aba === "abertos" })
    .limit(100);

  const pedidos = (data ?? []) as unknown as {
    id: string;
    criado_em: string;
    status: StatusPedido;
    total_centavos: number;
    forma_pagamento: FormaPagamento;
    status_pagamento: string;
    clientes: { id: string; nome: string } | null;
    itens_pedido: { produto_nome: string; quantidade: number; preco_unit_centavos: number }[];
  }[];

  return (
    <>
      <Cabecalho titulo="Pedidos da loja" descricao="Produtos comprados pelos clientes para retirar aqui." />
      <div className="mb-4 flex gap-1 rounded-xl bg-borda/60 p-1 text-sm font-medium sm:inline-flex">
        {(["abertos", "historico"] as const).map((a) => (
          <Link key={a} href={`?aba=${a}`} className={cx("flex-1 rounded-lg px-4 py-2 text-center", aba === a ? "bg-superficie shadow-cartao" : "text-tinta-2")}>
            {a === "abertos" ? "Em aberto" : "Histórico"}
          </Link>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <Vazio titulo={aba === "abertos" ? "Nenhum pedido em aberto" : "Nenhum pedido no histórico"} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {pedidos.map((p) => {
            const s = STATUS_PEDIDO[p.status];
            const pago = p.status_pagamento === "pago";
            return (
              <Cartao key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.clientes?.nome ?? "Cliente"}</p>
                    <p className="text-sm text-tinta-3">{dataHora(p.criado_em)}</p>
                  </div>
                  <Selo tom={s.tom}>{s.rotulo}</Selo>
                </div>
                <ul className="my-3 space-y-1 text-sm">
                  {p.itens_pedido.map((i, n) => (
                    <li key={n} className="flex justify-between gap-2">
                      <span>
                        {i.quantidade}× {i.produto_nome}
                      </span>
                      <span className="tabular text-tinta-3">{moeda(i.quantidade * i.preco_unit_centavos)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-borda pt-3">
                  <div className="text-sm">
                    <span className="font-semibold tabular">{moeda(p.total_centavos)}</span>{" "}
                    <span className={pago ? "text-[#0b7a5a]" : "text-[#8a5800]"}>
                      · {pago ? "Pago" : `A receber (${FORMA_PAGAMENTO[p.forma_pagamento]})`}
                    </span>
                  </div>
                </div>
                {aba === "abertos" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.status === "aberto" && (
                      <form action={mudarStatusPedido.bind(null, p.id, "pronto")}>
                        <BotaoEnviar tamanho="sm">Separado</BotaoEnviar>
                      </form>
                    )}
                    {!pago && (
                      <form action={registrarPagamentoPedido.bind(null, p.id)}>
                        <BotaoEnviar tamanho="sm" variante="secundario">Recebi o pagamento</BotaoEnviar>
                      </form>
                    )}
                    <form action={mudarStatusPedido.bind(null, p.id, "retirado")}>
                      <BotaoEnviar tamanho="sm" variante="secundario">Cliente retirou</BotaoEnviar>
                    </form>
                    <form action={mudarStatusPedido.bind(null, p.id, "cancelado")}>
                      <BotaoEnviar tamanho="sm" variante="fantasma">Cancelar</BotaoEnviar>
                    </form>
                  </div>
                )}
              </Cartao>
            );
          })}
        </div>
      )}
    </>
  );
}
