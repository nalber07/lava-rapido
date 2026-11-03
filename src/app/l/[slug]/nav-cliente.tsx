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
            className={cx("rounded-lg px-3 py-2 text-sm font-medium", on(i.href) ? "bg-agua-50 text-agua-700" : "text-tinta-2 hover:bg-fundo")}
          >
            {i.rotulo}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="pb-seguro fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {itens.map((i) => {
          const ativo = on(i.href, i.exato);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={ativo ? "page" : undefined}
                className={cx("flex flex-col items-center gap-1 pt-2.5 text-[11px] font-medium", ativo ? "text-agua-600" : "text-tinta-3")}
              >
                <i.icone className="size-[22px]" strokeWidth={ativo ? 2.25 : 1.75} aria-hidden />
                {i.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
