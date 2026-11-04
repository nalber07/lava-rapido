import Link from "next/link";
import { assinaturaLiberada, diasDeTeste, getContextoPainel, getUsuario } from "@/lib/auth";
import { BarraInferior, NavLateral } from "@/components/painel-nav";
import { Marca } from "@/components/marca";
import { AlternarTema } from "@/components/tema";
import { CriarEmpresa } from "./criar-empresa";

export default async function PainelLayout({ children }: LayoutProps<"/painel">) {
  const ctx = await getContextoPainel();

  if (!ctx) {
    const user = await getUsuario();
    const meta = (user?.user_metadata ?? {}) as Record<string, string>;
    return <CriarEmpresa nome={meta.empresa_nome ?? ""} slug={meta.empresa_slug ?? ""} telefone={meta.telefone ?? ""} />;
  }

  const { empresa, papel } = ctx;
  const liberada = assinaturaLiberada(empresa);
  const dias = diasDeTeste(empresa);

  return (
    <div className="md:grid md:min-h-dvh md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-borda bg-superficie px-3 py-6 md:flex">
        <div className="px-3 pb-7">
          <Marca href="/painel" nome={empresa.nome} />
        </div>
        <NavLateral dono={papel === "dono"} slug={empresa.slug} />
        <div className="mt-auto flex items-center justify-between gap-2 px-3">
          <form action="/sair" method="post">
            <button className="rounded-full px-1 py-2 text-sm text-tinta-3 transition-colors hover:text-tinta">Sair</button>
          </form>
          <AlternarTema />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-borda bg-fundo/80 px-4 py-2.5 backdrop-blur-xl md:hidden">
          <Marca href="/painel" nome={empresa.nome} />
          <AlternarTema />
        </header>

        {!liberada ? (
          <div className="bg-perigo px-4 py-2.5 text-center text-sm text-white">
            Sua assinatura está vencida. O painel está só para consulta.{" "}
            {papel === "dono" && (
              <Link href="/painel/assinatura" className="font-semibold underline">
                Regularizar
              </Link>
            )}
          </div>
        ) : empresa.status_assinatura === "teste" && dias <= 7 ? (
          <div className="bg-ambar-50 px-4 py-2.5 text-center text-sm text-ambar-700">
            {dias === 0 ? "Seu teste termina hoje." : `Faltam ${dias} dia${dias > 1 ? "s" : ""} de teste grátis.`}{" "}
            {papel === "dono" && (
              <Link href="/painel/assinatura" className="font-semibold underline">
                Assinar
              </Link>
            )}
          </div>
        ) : null}

        <main className="animate-pagina mx-auto max-w-5xl px-4 pb-32 pt-5 md:px-8 md:pb-12 md:pt-9">{children}</main>
      </div>
      <BarraInferior />
    </div>
  );
}
