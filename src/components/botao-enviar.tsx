"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { Botao } from "@/components/ui";

export function BotaoEnviar({
  children,
  pendente = "Salvando…",
  ...p
}: ComponentProps<typeof Botao> & { pendente?: string }) {
  const { pending } = useFormStatus();
  return (
    <Botao type="submit" disabled={pending || p.disabled} aria-busy={pending} {...p}>
      {pending ? pendente : children}
    </Botao>
  );
}
