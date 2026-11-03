import type { Metadata } from "next";
import { getClienteAtual, getEmpresaPorSlug } from "@/lib/vitrine";
import { createClient } from "@/lib/supabase/server";
import { Vazio } from "@/components/ui";
import { Carrinho } from "./carrinho";
import type { Produto } from "@/lib/types";

export const metadata: Metadata = { title: "Loja" };

export default async function Loja({ params }: PageProps<"/l/[slug]/loja">) {
  const { slug } = await params;
  const e = await getEmpresaPorSlug(slug);
  const { user, cliente } = await getClienteAtual(e.id);
  const supabase = await createClient();
  const { data } = await supabase.from("produtos").select("*").eq("empresa_id", e.id).eq("ativo", true).order("nome");
  const produtos = (data ?? []) as Produto[];

  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight">Loja</h1>
      <p className="mb-5 text-sm text-tinta-3">Compre agora e retire no {e.nome}.</p>
      {produtos.length === 0 ? (
        <Vazio titulo="Nenhum produto à venda no momento" />
      ) : (
        <Carrinho
          empresaId={e.id}
          slug={slug}
          produtos={produtos}
          aceitaOnline={e.aceita_pagamento_online}
          estado={!user ? "deslogado" : !cliente ? "sem_cadastro" : "ok"}
        />
      )}
    </>
  );
}
