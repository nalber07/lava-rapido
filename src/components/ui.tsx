import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Tom } from "@/lib/types";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variante = "primario" | "secundario" | "fantasma" | "perigo" | "sinal" | "tinta";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,border-color,transform,box-shadow] duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none";
const tamanhos = { md: "h-11 px-5 text-[15px]", sm: "h-10 px-4 text-sm", lg: "h-12 px-7 text-base" };
const primario =
  "reflexo bg-acao text-sobre-acao shadow-[0_8px_24px_-10px_rgb(252_163_17/0.7)] hover:bg-acao-forte hover:shadow-[0_10px_28px_-8px_rgb(252_163_17/0.8)]";
const variantes: Record<Variante, string> = {
  primario,
  sinal: primario,
  secundario: "border border-borda-forte bg-superficie text-tinta hover:border-tinta-3 hover:bg-superficie-2",
  fantasma: "text-agua-700 hover:bg-agua-50",
  perigo: "bg-perigo-50 text-perigo hover:bg-perigo hover:text-white",
  /* Inverte com o tema: preto no claro, branco no escuro. */
  tinta: "reflexo bg-tinta text-fundo hover:opacity-90",
};

export function classeBotao(v: Variante = "primario", t: keyof typeof tamanhos = "md") {
  return cx(base, tamanhos[t], variantes[v]);
}

export function Botao({
  variante = "primario",
  tamanho = "md",
  className,
  ...p
}: ComponentProps<"button"> & { variante?: Variante; tamanho?: keyof typeof tamanhos }) {
  return <button className={cx(classeBotao(variante, tamanho), className)} {...p} />;
}

export function BotaoLink({
  variante = "primario",
  tamanho = "md",
  className,
  ...p
}: ComponentProps<typeof Link> & { variante?: Variante; tamanho?: keyof typeof tamanhos }) {
  return <Link className={cx(classeBotao(variante, tamanho), className)} {...p} />;
}

export function Cartao({ className, ...p }: ComponentProps<"div">) {
  return (
    <div
      className={cx("chanfro metal rounded-cartao border border-borda bg-superficie shadow-cartao", className)}
      {...p}
    />
  );
}

export function Campo({
  rotulo,
  dica,
  children,
  className,
}: {
  rotulo: string;
  dica?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-tinta-2">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-xs text-tinta-3">{dica}</span>}
    </label>
  );
}

const classeInput =
  "w-full h-11 rounded-xl border border-borda-forte bg-superficie px-3.5 text-[15px] text-tinta placeholder:text-tinta-3 focus:border-acao focus:ring-4 focus:ring-acao/20 outline-none transition";

export function Entrada({ className, ...p }: ComponentProps<"input">) {
  return <input className={cx(classeInput, className)} {...p} />;
}

const SETA =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888f9f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function Selecao({ className, ...p }: ComponentProps<"select">) {
  return (
    <select
      className={cx(classeInput, "appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)}
      style={{ backgroundImage: SETA }}
      {...p}
    />
  );
}

export function AreaTexto({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea className={cx(classeInput, "h-auto min-h-20 py-2.5", className)} {...p} />;
}

const tons: Record<Tom, string> = {
  azul: "bg-agua-50 text-agua-700",
  verde: "bg-espuma-50 text-espuma-700",
  ambar: "bg-ambar-50 text-ambar-700",
  vermelho: "bg-perigo-50 text-perigo",
  neutro: "bg-fundo text-tinta-2",
};

export function Selo({ tom = "neutro", children, className }: { tom?: Tom; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tons[tom], className)}>
      {children}
    </span>
  );
}

export function Cabecalho({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[22px] leading-tight tracking-tight text-tinta md:text-[28px]">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-tinta-3">{descricao}</p>}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}

export function Vazio({ titulo, texto, acao }: { titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="chanfro rounded-cartao border border-dashed border-borda-forte px-6 py-10 text-center">
      <p className="font-medium text-tinta">{titulo}</p>
      {texto && <p className="mx-auto mt-1 max-w-sm text-sm text-tinta-3">{texto}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

export function Aviso({ tom = "azul", children }: { tom?: Tom; children: ReactNode }) {
  return <div className={cx("rounded-xl px-4 py-3 text-sm", tons[tom])}>{children}</div>;
}

export function Secao({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[15px] tracking-wide text-tinta">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/** Placa no padrão Mercosul (faixa azul em cima). */
export function Placa({ placa, className }: { placa: string; className?: string }) {
  return (
    <span className={cx("placa text-[13px]", className)} title={`Placa ${placa}`}>
      <span>{placa}</span>
    </span>
  );
}
