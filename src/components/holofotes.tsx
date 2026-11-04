"use client";

import { useEffect } from "react";

/** Passa a posição do cursor para os elementos `.holofote` (brilho que segue o mouse). */
export function Holofotes() {
  useEffect(() => {
    if (matchMedia("(hover: none)").matches) return;
    function mover(e: PointerEvent) {
      const alvo = (e.target as Element | null)?.closest<HTMLElement>(".holofote");
      if (!alvo) return;
      const r = alvo.getBoundingClientRect();
      alvo.style.setProperty("--mx", `${e.clientX - r.left}px`);
      alvo.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
    document.addEventListener("pointermove", mover, { passive: true });
    return () => document.removeEventListener("pointermove", mover);
  }, []);
  return null;
}
