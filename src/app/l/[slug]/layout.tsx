import type { Metadata } from "next";
import { getEmpresaPorSlug } from "@/lib/vitrine";
import { NavCliente } from "./nav-cliente";
import { AlternarTema } from "@/components/tema";

export async function generateMetadata({ params }: LayoutProps<"/l/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEmpresaPorSlug(slug);
  return {
    title: { default: e.nome, template: `%s · ${e.nome}` },
    description: e.descricao ?? `Agende sua lavagem no ${e.nome}.`,
    manifest: undefined,
  };
}

export default async function LayoutVitrine({ children, params }: LayoutProps<"/l/[slug]">) {
  const { slug } = await params;
  const e = await getEmpresaPorSlug(slug);
  return (
    <div className="min-h-dvh pb-28 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-borda bg-fundo/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <a href={`/l/${slug}`} className="flex min-w-0 items-center gap-2.5">
            {e.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.logo_url} alt="" className="chanfro size-9 rounded-xl object-cover" />
            ) : (
              <span className="grid size-9 shrink-0 place-items-center chanfro rounded-xl bg-acao font-display text-sobre-acao">
                {e.nome.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate font-display text-base tracking-tight">{e.nome}</span>
          </a>
          <div className="flex items-center gap-2">
            <NavCliente slug={slug} variante="topo" />
            <AlternarTema />
          </div>
        </div>
      </header>
      <div className="animate-pagina mx-auto max-w-3xl px-4 pt-6">{children}</div>
      <NavCliente slug={slug} variante="baixo" />
    </div>
  );
}
