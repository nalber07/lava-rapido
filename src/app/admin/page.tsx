import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Marca } from "@/components/marca";
import { Cartao, Selo } from "@/components/ui";
import { moeda } from "@/lib/format";
import { planoPorId } from "@/lib/planos";

export const metadata: Metadata = { title: "Admin" };

export default async function Admin() {
  const supabase = await createClient();
  const { data: ehAdmin } = await supabase.rpc("is_admin");
  if (!ehAdmin) notFound();

  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nome, slug, cidade, plano_id, status_assinatura, teste_ate, assinatura_ate, criado_em")
    .order("criado_em", { ascending: false });
  const lista = empresas ?? [];
  const ativas = lista.filter((e) => e.status_assinatura === "ativa");
  const mrr = ativas.reduce((t, e) => t + planoPorId(e.plano_id).preco_centavos, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Marca />
      <h1 className="mt-8 font-display text-2xl font-semibold">Administração da plataforma</h1>
      <div className="my-6 grid grid-cols-3 gap-3">
        <Cartao className="p-4">
          <p className="text-sm text-tinta-3">Lava rápidos</p>
          <p className="font-display text-2xl font-semibold">{lista.length}</p>
        </Cartao>
        <Cartao className="p-4">
          <p className="text-sm text-tinta-3">Assinantes</p>
          <p className="font-display text-2xl font-semibold">{ativas.length}</p>
        </Cartao>
        <Cartao className="p-4">
          <p className="text-sm text-tinta-3">Receita mensal</p>
          <p className="font-display text-2xl font-semibold tabular">{moeda(mrr)}</p>
        </Cartao>
      </div>
      <Cartao className="divide-y divide-borda overflow-hidden">
        {lista.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <a href={`/l/${e.slug}`} target="_blank" className="font-medium hover:underline">
                {e.nome}
              </a>
              <p className="text-sm text-tinta-3">
                {e.cidade ?? "—"} · desde {new Date(e.criado_em).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <span className="text-sm">{planoPorId(e.plano_id).nome}</span>
            <Selo tom={e.status_assinatura === "ativa" ? "verde" : e.status_assinatura === "teste" ? "azul" : "vermelho"}>{e.status_assinatura}</Selo>
          </div>
        ))}
      </Cartao>
    </main>
  );
}
