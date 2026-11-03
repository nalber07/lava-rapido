"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { Resultado } from "@/lib/resultado";
import { cx } from "@/components/ui";

/** Form com mensagem de erro/sucesso vinda de uma Server Action. */
export function Formulario({
  acao,
  children,
  className,
  limparAoSalvar = false,
}: {
  acao: (estado: Resultado, dados: FormData) => Promise<Resultado>;
  children: ReactNode;
  className?: string;
  limparAoSalvar?: boolean;
}) {
  const [estado, despachar] = useActionState(acao, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado?.ok && limparAoSalvar) ref.current?.reset();
  }, [estado, limparAoSalvar]);

  return (
    <form ref={ref} action={despachar} className={className}>
      {children}
      {estado?.mensagem && (
        <p
          role="status"
          className={cx("mt-3 rounded-lg px-3 py-2 text-sm", estado.ok ? "bg-espuma-50 text-[#0b7a5a]" : "bg-perigo-50 text-perigo")}
        >
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
