import Link from "next/link";
import { cx } from "@/components/ui";

/** Símbolo da Pista: gota em movimento, com as linhas de velocidade. */
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cx("shrink-0", className)} aria-hidden>
      <rect width="512" height="512" rx="112" fill="#0f1f52" />
      <path
        d="M316 92c-6 0-11 4-14 9-30 50-98 132-98 205a112 112 0 0 0 224 0c0-73-68-155-98-205-3-5-8-9-14-9z"
        fill="#ffcb2e"
      />
      <path d="M262 330a58 58 0 0 0 50 52" stroke="#0f1f52" strokeWidth="22" strokeLinecap="round" fill="none" />
      <g stroke="#ffcb2e" strokeWidth="24" strokeLinecap="round">
        <path d="M118 250h52" />
        <path d="M78 306h96" />
        <path d="M118 362h56" />
      </g>
    </svg>
  );
}

/** Logo: com `nome`, mostra o nome do lava rápido (painel); sem, a marca Pista. */
export function Marca({
  href = "/",
  nome,
  claro = false,
}: {
  href?: string;
  nome?: string;
  claro?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex min-w-0 items-center gap-2.5 font-display font-bold leading-none",
        claro ? "text-white" : "text-tinta",
        nome ? "text-xl tracking-tight" : "text-[26px] tracking-[-0.01em]",
      )}
    >
      <Simbolo className={cx("size-8 rounded-[0.55rem]", claro && "ring-1 ring-white/25")} />
      <span className="truncate">{nome ?? "Pista"}</span>
    </Link>
  );
}
