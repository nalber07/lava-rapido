"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

/** Campo de arquivo com rótulo em português (o nativo aparece em inglês). */
export function InputFotos({ name, multiplo = true, rotulo = "Escolher fotos", camera = false }: { name: string; multiplo?: boolean; rotulo?: string; camera?: boolean }) {
  const [qtd, setQtd] = useState(0);
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-borda-forte px-3.5 py-2.5 text-sm hover:bg-fundo focus-within:ring-3 focus-within:ring-agua-100">
      <Camera className="size-5 shrink-0 text-agua-600" aria-hidden />
      <span className="flex-1 font-medium text-agua-700">{rotulo}</span>
      <span className="text-tinta-3">{qtd === 0 ? "Nenhuma" : qtd === 1 ? "1 selecionada" : `${qtd} selecionadas`}</span>
      <input
        type="file"
        name={name}
        accept="image/*"
        multiple={multiplo}
        capture={camera ? "environment" : undefined}
        className="sr-only"
        onChange={(e) => setQtd(e.currentTarget.files?.length ?? 0)}
      />
    </label>
  );
}
