import Link from "next/link";
import { cx } from "@/components/ui";

/**
 * Símbolo da Pista: a pista vista de frente, com as bordas indo para o horizonte
 * e as faixas centrais em ouro. As bordas usam a cor do texto, então acompanham o tema.
 */
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cx("simbolo shrink-0", className)} aria-hidden>
      <path d="M6 58 26 8M58 58 38 8" stroke="currentColor" strokeWidth="5.5" strokeLinecap="square" fill="none" />
      <g className="simbolo-faixas" fill="#fca311">
        <path d="M28 58h8l-1-12h-6z" />
        <path d="M29.5 40h5l-.5-10h-4z" />
        <path d="M30.6 24h2.8l-.3-7h-2.2z" />
      </g>
    </svg>
  );
}

/** Logo da Pista. Com `nome`, mostra o nome do lava rápido no lugar da marca (painel). */
export function Marca({ href = "/", nome, className }: { href?: string; nome?: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label={nome ? `${nome}, início` : "Pista, início"}
      className={cx("group inline-flex min-w-0 items-center gap-3 text-tinta", className)}
    >
      <Simbolo className="size-8 transition-transform duration-500 group-hover:scale-110" />
      {nome ? (
        <span className="truncate font-display text-[15px] leading-tight">{nome}</span>
      ) : (
        <span className="font-display text-[17px] leading-none tracking-[0.32em]">PISTA</span>
      )}
    </Link>
  );
}
