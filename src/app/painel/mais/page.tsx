import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { exigirPainel } from "@/lib/auth";
import { ITENS_PAINEL } from "@/lib/navegacao";
import { Cabecalho, Cartao } from "@/components/ui";

export default async function Mais() {
  const { papel, empresa, email } = await exigirPainel();
  const itens = ITENS_PAINEL.filter((i) => papel === "dono" || !i.dono);
  return (
    <>
      <Cabecalho titulo="Menu" descricao={email} />
      <Cartao className="divide-y divide-borda overflow-hidden">
        {itens.map((i) => (
          <Link key={i.href} href={i.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-fundo">
            <i.icone className="size-5 text-tinta-2" aria-hidden />
            <span className="flex-1 font-medium">{i.rotulo}</span>
            <ChevronRight className="size-4 text-tinta-3" aria-hidden />
          </Link>
        ))}
        <a href={`/l/${empresa.slug}`} target="_blank" className="flex items-center gap-3 px-4 py-3.5 hover:bg-fundo">
          <ExternalLink className="size-5 text-tinta-2" aria-hidden />
          <span className="flex-1 font-medium">Minha página de agendamento</span>
        </a>
      </Cartao>
      <form action="/sair" method="post" className="mt-6">
        <button className="w-full rounded-xl py-3 text-center font-medium text-perigo hover:bg-perigo-50">Sair da conta</button>
      </form>
    </>
  );
}
