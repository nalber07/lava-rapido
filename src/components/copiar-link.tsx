"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Botao } from "@/components/ui";

export function CopiarLink({ caminho, titulo }: { caminho: string; titulo: string }) {
  const [ok, setOk] = useState(false);
  async function acao() {
    const url = `${window.location.origin}${caminho}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        /* usuário cancelou */
      }
    }
    await navigator.clipboard.writeText(url);
    setOk(true);
    setTimeout(() => setOk(false), 2000);
  }
  return (
    <Botao variante="secundario" tamanho="sm" onClick={acao} type="button">
      {ok ? <Check className="size-4" aria-hidden /> : typeof navigator !== "undefined" && "share" in navigator ? <Share2 className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {ok ? "Copiado" : "Compartilhar"}
    </Botao>
  );
}
