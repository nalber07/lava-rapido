import Link from "next/link";
import { assinaturaLiberada, diasDeTeste, getContextoPainel, getUsuario } from "@/lib/auth";
import { BarraInferior, NavLateral } from "@/components/painel-nav";
import { Marca } from "@/components/marca";
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
      <aside className="escuro sticky top-0 hidden h-dvh flex-col bg-agua-900 px-3 py-5 md:flex">
        <div className="px-3 pb-6">
          <Marca href="/painel" nome={empresa.nome} claro />
        </div>
        <NavLateral dono={papel === "dono"} slug={empresa.slug} />
        <form action="/sair" method="post" className="mt-auto px-3">
          <button className="text-sm text-agua-200 hover:text-white">Sair</button>
        </form>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-borda bg-superficie/95 px-4 py-3 backdrop-blur md:hidden">
          <Marca href="/painel" nome={empresa.nome} />
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

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>
      <BarraInferior />
    </div>
  );
}
