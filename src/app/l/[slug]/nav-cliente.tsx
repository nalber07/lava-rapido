"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, Home, ShoppingBag, UserRound } from "lucide-react";
import { cx } from "@/components/ui";

export function NavCliente({ slug, variante }: { slug: string; variante: "topo" | "baixo" }) {
  const path = usePathname();
  const base = `/l/${slug}`;
  const itens = [
    { href: base, rotulo: "Início", icone: Home, exato: true },
    { href: `${base}/agendar`, rotulo: "Agendar", icone: CalendarPlus },
    { href: `${base}/loja`, rotulo: "Loja", icone: ShoppingBag },
    { href: `${base}/conta`, rotulo: "Minha conta", icone: UserRound },
  ];
  const on = (h: string, exato?: boolean) => (exato ? path === h : path.startsWith(h));

  if (variante === "topo") {
    return (
      <nav className="hidden gap-1 md:flex">
        {itens.slice(1).map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={cx("rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300", on(i.href) ? "bg-acao text-sobre-acao" : "text-tinta-2 hover:bg-superficie-2 hover:text-tinta")}
          >
            {i.rotulo}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="pb-seguro fixed inset-x-0 bottom-0 z-30 px-3 md:hidden" aria-label="Navegação">
      <ul className="chanfro metal mx-auto grid max-w-md grid-cols-4 rounded-[1.5rem] border border-borda bg-superficie/90 p-1.5 shadow-flutuante backdrop-blur-xl">
        {itens.map((i) => {
          const ativo = on(i.href, i.exato);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={ativo ? "page" : undefined}
                className={cx("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[1.1rem] text-[11px] font-semibold transition-all duration-300", ativo ? "bg-acao text-sobre-acao" : "text-tinta-3 active:scale-95")}
              >
                <i.icone className="size-5" strokeWidth={ativo ? 2.25 : 1.75} aria-hidden />
                {i.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
