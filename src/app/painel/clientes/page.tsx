import Link from "next/link";
import { ChevronRight, Search, UserPlus } from "lucide-react";
import { exigirPainel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BotaoLink, Cabecalho, Cartao, Entrada, Vazio } from "@/components/ui";
import { placaFormatada } from "@/lib/format";

export default async function Clientes({ searchParams }: PageProps<"/painel/clientes">) {
  const { empresa } = await exigirPainel();
  const sp = await searchParams;
  const busca = typeof sp.q === "string" ? sp.q.trim() : "";
  const supabase = await createClient();

  let q = supabase
    .from("clientes")
    .select("id, nome, telefone, selos, veiculos(placa, modelo)")
    .eq("empresa_id", empresa.id)
    .order("nome")
    .limit(200);
  if (busca) {
    const placa = busca.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const { data: porPlaca } = placa.length >= 3
      ? await supabase.from("veiculos").select("cliente_id").eq("empresa_id", empresa.id).ilike("placa", `%${placa}%`)
      : { data: [] };
    const ids = (porPlaca ?? []).map((v) => v.cliente_id);
    const termo = busca.replace(/[%,()]/g, "");
    q = q.or([`nome.ilike.%${termo}%`, `telefone.ilike.%${termo}%`, ids.length ? `id.in.(${ids.join(",")})` : ""].filter(Boolean).join(","));
  }
  const { data } = await q;
  const clientes = (data ?? []) as unknown as {
    id: string;
    nome: string;
    telefone: string | null;
    selos: number;
    veiculos: { placa: string; modelo: string | null }[];
  }[];

  return (
    <>
      <Cabecalho
        titulo="Clientes"
        acao={
          <BotaoLink href="/painel/clientes/novo" tamanho="sm" aria-label="Novo cliente">
            <UserPlus className="size-4" aria-hidden /> <span className="hidden sm:inline">Novo cliente</span>
          </BotaoLink>
        }
      />
      <form className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tinta-3" aria-hidden />
        <Entrada name="q" defaultValue={busca} placeholder="Buscar por nome, telefone ou placa" className="pl-10" type="search" />
      </form>

      {clientes.length === 0 ? (
        <Vazio
          titulo={busca ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          texto={busca ? "Tente outro nome ou placa." : "Clientes que agendam pela sua página entram aqui automaticamente."}
        />
      ) : (
        <Cartao className="divide-y divide-borda overflow-hidden">
          {clientes.map((c) => (
            <Link key={c.id} href={`/painel/clientes/${c.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-fundo">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-agua-50 font-semibold text-agua-700">
                {c.nome.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.nome}</p>
                <p className="truncate text-sm text-tinta-3">
                  {c.veiculos.length > 0
                    ? c.veiculos.map((v) => [v.modelo, placaFormatada(v.placa)].filter(Boolean).join(" ")).join(", ")
                    : c.telefone ?? "Sem veículo"}
                </p>
              </div>
              <ChevronRight className="size-4 text-tinta-3" aria-hidden />
            </Link>
          ))}
        </Cartao>
      )}
    </>
  );
}
