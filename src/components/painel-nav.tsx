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
    <nav className="flex flex-col gap-0.5">
      {todos
        .filter((i) => dono || !i.dono)
        .map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={ativo(path, i.href, i.exato) ? "page" : undefined}
            className={cx(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
              ativo(path, i.href, i.exato)
                ? "bg-white/12 font-semibold text-white"
                : "text-agua-200 hover:bg-white/5 hover:text-white",
            )}
          >
            <i.icone className="size-[18px]" aria-hidden />
            {i.rotulo}
          </Link>
        ))}
      <a
        href={`/l/${slug}`}
        target="_blank"
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-sinal hover:bg-white/5"
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

export function BarraInferior() {
  const path = usePathname();
  const emMais = !barra.slice(0, 4).some((i) => ativo(path, i.href, i.exato));
  return (
    <nav className="pb-seguro fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {barra.map((i) => {
          const on = i.href === "/painel/mais" ? emMais : ativo(path, i.href, i.exato);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={cx("flex flex-col items-center gap-1 pt-2.5 text-[11px] font-medium", on ? "text-agua-600" : "text-tinta-3")}
                aria-current={on ? "page" : undefined}
              >
                <i.icone className="size-[22px]" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                {i.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

