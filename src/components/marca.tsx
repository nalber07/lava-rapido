import Link from "next/link";

export function Marca({ href = "/", nome = "Lava Rápido" }: { href?: string; nome?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-tinta">
      <svg viewBox="0 0 512 512" className="size-8 shrink-0" aria-hidden>
        <rect width="512" height="512" rx="112" fill="#0b62c4" />
        <path d="M256 92c-8 0-14 5-18 12-34 56-98 136-98 202a116 116 0 0 0 232 0c0-66-64-146-98-202-4-7-10-12-18-12z" fill="#fff" />
        <path d="M196 318a62 62 0 0 0 54 60" stroke="#0b62c4" strokeWidth="22" strokeLinecap="round" fill="none" />
      </svg>
      <span className="truncate">{nome}</span>
    </Link>
  );
}
