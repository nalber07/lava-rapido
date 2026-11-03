import type { Metadata } from "next";
import { getEmpresaPorSlug } from "@/lib/vitrine";
import { NavCliente } from "./nav-cliente";

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
    <div className="min-h-dvh pb-24 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-borda bg-superficie/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <a href={`/l/${slug}`} className="flex min-w-0 items-center gap-2.5">
            {e.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.logo_url} alt="" className="size-9 rounded-xl object-cover" />
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-agua-600 font-display font-semibold text-white">
                {e.nome.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="truncate font-display text-lg font-semibold tracking-tight">{e.nome}</span>
          </a>
          <NavCliente slug={slug} variante="topo" />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-5">{children}</div>
      <NavCliente slug={slug} variante="baixo" />
    </div>
  );
}
