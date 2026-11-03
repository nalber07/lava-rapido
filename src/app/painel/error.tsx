"use client";

import { Botao } from "@/components/ui";

export default function Erro({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="mx-auto mt-1 max-w-md text-tinta-3">{error.message || "Tente de novo em instantes."}</p>
      <Botao className="mt-6" onClick={reset}>
        Tentar de novo
      </Botao>
    </div>
  );
}
