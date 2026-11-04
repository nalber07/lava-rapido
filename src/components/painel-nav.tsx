"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ExternalLink, Home, LayoutGrid, ShoppingBag, Users } from "lucide-react";
import { cx } from "@/components/ui";
import { ITENS_PAINEL as todos } from "@/lib/navegacao";

function ativo(path: string, href: string, exato?: boolean) {
  return exato ? path === href : path === href || path.startsWith(`${href}/`);
}

export function NavLateral({ dono, slug }: { dono: boolean; slug: string }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Painel">
      {todos
        .filter((i) => dono || !i.dono)
        .map((i) => {
          const on = ativo(path, i.href, i.exato);
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={on ? "page" : undefined}
              className={cx(
                "group flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] font-medium transition-all duration-300",
                on
                  ? "bg-acao font-semibold text-sobre-acao shadow-[0_8px_20px_-10px_rgb(252_163_17/0.8)]"
                  : "text-tinta-2 hover:bg-superficie-2 hover:text-tinta",
              )}
            >
              <i.icone
                className={cx("size-[18px] transition-transform duration-300", !on && "group-hover:translate-x-0.5")}
                aria-hidden
              />
              {i.rotulo}
            </Link>
          );
        })}
      <a
        href={`/l/${slug}`}
        target="_blank"
        className="mt-4 flex items-center gap-3 rounded-full border border-dashed border-borda-forte px-4 py-2.5 text-[15px] font-medium text-agua-700 transition-colors hover:border-acao"
      >
        <ExternalLink className="size-[18px]" aria-hidden />
        Minha página
      </a>
    </nav>
  );
}

const barra = [
  { href: "/painel", rotulo: "Início", icone: Home, exato: true },
  { href: "/painel/agenda", rotulo: "Agenda", icone: CalendarDays },
  { href: "/painel/clientes", rotulo: "Clientes", icone: Users },
  { href: "/painel/pedidos", rotulo: "Pedidos", icone: ShoppingBag },
  { href: "/painel/mais", rotulo: "Mais", icone: LayoutGrid },
];

/** Barra do celular: uma doca flutuante; o item ativo vira uma pílula dourada. */
export function BarraInferior() {
  const path = usePathname();
  const emMais = !barra.slice(0, 4).some((i) => ativo(path, i.href, i.exato));
  return (
    <nav className="pb-seguro fixed inset-x-0 bottom-0 z-30 px-3 md:hidden" aria-label="Painel">
      <ul className="chanfro metal mx-auto grid max-w-md grid-cols-5 rounded-[1.5rem] border border-borda bg-superficie/90 p-1.5 shadow-flutuante backdrop-blur-xl">
        {barra.map((i) => {
          const on = i.href === "/painel/mais" ? emMais : ativo(path, i.href, i.exato);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={on ? "page" : undefined}
                className={cx(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[1.1rem] text-[11px] font-semibold transition-all duration-300",
                  on ? "bg-acao text-sobre-acao" : "text-tinta-3 active:scale-95",
                )}
              >
                <i.icone className={cx("size-5 transition-transform duration-300", on && "-translate-y-px")} strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                {i.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
