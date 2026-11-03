"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Botao, classeBotao, cx } from "@/components/ui";
import { comprar } from "../actions";
import { moeda } from "@/lib/format";
import type { Produto } from "@/lib/types";

export function Carrinho({
  empresaId,
  slug,
  produtos,
  aceitaOnline,
  estado,
}: {
  empresaId: string;
  slug: string;
  produtos: Produto[];
  aceitaOnline: boolean;
  estado: "deslogado" | "sem_cadastro" | "ok";
}) {
  const router = useRouter();
  const [qtd, setQtd] = useState<Record<string, number>>({});
  const [forma, setForma] = useState<"no_local" | "pix" | "cartao">(aceitaOnline ? "pix" : "no_local");
  const [erro, setErro] = useState("");
  const [enviando, iniciar] = useTransition();

  const itens = produtos.filter((p) => (qtd[p.id] ?? 0) > 0);
  const total = itens.reduce((t, p) => t + p.preco_centavos * qtd[p.id], 0);
  const mudar = (p: Produto, d: number) =>
    setQtd((q) => ({ ...q, [p.id]: Math.max(0, Math.min(p.estoque, (q[p.id] ?? 0) + d)) }));

  function finalizar() {
    setErro("");
    iniciar(async () => {
      const r = await comprar({
        empresaId,
        slug,
        forma,
        itens: itens.map((p) => ({ produto_id: p.id, quantidade: qtd[p.id] })),
      });
      if (!r.ok) return setErro(r.mensagem);
      if (r.redirecionar.startsWith("http")) window.location.href = r.redirecionar;
      else router.push(r.redirecionar);
    });
  }

  return (
    <div className="pb-40">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {produtos.map((p) => {
          const n = qtd[p.id] ?? 0;
          const esgotado = p.estoque === 0;
          return (
            <div key={p.id} className={cx("flex flex-col overflow-hidden rounded-cartao border bg-superficie", n > 0 ? "border-agua-600" : "border-borda")}>
              <div className="aspect-square bg-fundo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.foto_url && <img src={p.foto_url} alt="" className="size-full object-cover" loading="lazy" />}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-sm font-medium leading-snug">{p.nome}</p>
                {p.descricao && <p className="mt-0.5 line-clamp-2 text-xs text-tinta-3">{p.descricao}</p>}
                <p className="mt-auto pt-2 font-semibold tabular">{moeda(p.preco_centavos)}</p>
                {esgotado ? (
                  <p className="mt-2 text-center text-sm text-tinta-3">Esgotado</p>
                ) : n === 0 ? (
                  <Botao variante="secundario" tamanho="sm" className="mt-2" onClick={() => mudar(p, 1)}>
                    Adicionar
                  </Botao>
                ) : (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-agua-50">
                    <button className="grid size-9 place-items-center text-agua-700" onClick={() => mudar(p, -1)} aria-label={`Remover um ${p.nome}`}>
                      <Minus className="size-4" />
                    </button>
                    <span className="font-semibold tabular text-agua-700" aria-live="polite">{n}</span>
                    <button className="grid size-9 place-items-center text-agua-700 disabled:opacity-40" onClick={() => mudar(p, 1)} disabled={n >= p.estoque} aria-label={`Adicionar mais um ${p.nome}`}>
                      <Plus className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {itens.length > 0 && (
        <div className="pb-seguro fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-superficie px-4 pt-3 shadow-flutuante">
          <div className="mx-auto max-w-3xl">
            {erro && <p className="mb-2 rounded-lg bg-perigo-50 px-3 py-2 text-sm text-perigo">{erro}</p>}
            {estado === "ok" && aceitaOnline && (
              <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-fundo p-1 text-sm font-medium">
                {(["pix", "cartao", "no_local"] as const).map((f) => (
                  <button key={f} onClick={() => setForma(f)} className={cx("rounded-lg py-1.5", forma === f ? "bg-superficie shadow-cartao" : "text-tinta-2")} aria-pressed={forma === f}>
                    {f === "pix" ? "Pix" : f === "cartao" ? "Cartão" : "Na retirada"}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-tinta-3">{itens.reduce((t, p) => t + qtd[p.id], 0)} item(ns)</p>
                <p className="font-display text-xl font-semibold tabular">{moeda(total)}</p>
              </div>
              {estado === "ok" ? (
                <Botao tamanho="lg" onClick={finalizar} disabled={enviando}>
                  {enviando ? "Enviando…" : forma === "no_local" ? "Reservar" : "Pagar"}
                </Botao>
              ) : (
                <Link href={estado === "deslogado" ? `/entrar?modo=criar&next=/l/${slug}/loja` : `/l/${slug}/conta`} className={classeBotao("primario", "lg")}>
                  {estado === "deslogado" ? "Entrar para comprar" : "Completar cadastro"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
