"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cx } from "@/components/ui";

type Tema = "claro" | "escuro";

/** Lido antes da pintura (no <head>) para não piscar o tema errado. */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("tema");if(t==="claro"||t==="escuro")document.documentElement.dataset.tema=t;}catch(e){}})();`;

function atual(): Tema {
  const d = document.documentElement.dataset.tema;
  if (d === "claro" || d === "escuro") return d;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

function assinar(cb: () => void) {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
  mq.addEventListener("change", cb);
  return () => {
    obs.disconnect();
    mq.removeEventListener("change", cb);
  };
}

export function AlternarTema({ className }: { className?: string }) {
  const tema = useSyncExternalStore<Tema | null>(assinar, atual, () => null);
  const proximo: Tema = tema === "escuro" ? "claro" : "escuro";

  function trocar() {
    const aplicar = () => {
      document.documentElement.dataset.tema = proximo;
      try {
        localStorage.setItem("tema", proximo);
      } catch {}
    };
    // Transição suave entre temas quando o navegador suporta.
    const doc = document as Document & { startViewTransition?: (f: () => void) => unknown };
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(aplicar);
    else aplicar();
  }

  return (
    <button
      type="button"
      onClick={trocar}
      aria-label={tema ? `Usar tema ${proximo}` : "Alternar tema"}
      title={tema ? `Tema ${proximo}` : undefined}
      className={cx(
        "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-borda text-tinta-2 transition-colors hover:border-borda-forte hover:text-tinta",
        className,
      )}
    >
      <Sun
        className={cx("absolute size-[18px] transition-all duration-500", tema === "escuro" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")}
        aria-hidden
      />
      <Moon
        className={cx("absolute size-[18px] transition-all duration-500", tema === "escuro" ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")}
        aria-hidden
      />
    </button>
  );
}
