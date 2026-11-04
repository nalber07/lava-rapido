import { Check } from "lucide-react";
import { assinaturaLiberada, diasDeTeste, exigirDono } from "@/lib/auth";
import { Aviso, Cabecalho, Cartao, Selo, cx } from "@/components/ui";
import { BotaoEnviar } from "@/components/botao-enviar";
import { assinarPlataforma } from "../actions";
import { PLANOS, planoPorId } from "@/lib/planos";
import { moeda } from "@/lib/format";

export default async function Assinatura({ searchParams }: PageProps<"/painel/assinatura">) {
  const { empresa } = await exigirDono();
  const sp = await searchParams;
  const atual = planoPorId(empresa.plano_id);
  const liberada = assinaturaLiberada(empresa);
  const configurado = Boolean(process.env.MP_ACCESS_TOKEN);

  const situacao =
    empresa.status_assinatura === "ativa"
      ? { tom: "verde" as const, texto: `Ativa${empresa.assinatura_ate ? ` · renova em ${new Date(empresa.assinatura_ate).toLocaleDateString("pt-BR")}` : ""}` }
      : empresa.status_assinatura === "teste"
        ? { tom: liberada ? ("azul" as const) : ("vermelho" as const), texto: liberada ? `Teste grátis · ${diasDeTeste(empresa)} dia(s) restantes` : "Teste encerrado" }
        : { tom: "vermelho" as const, texto: empresa.status_assinatura === "atrasada" ? "Pagamento atrasado" : "Cancelada" };

  return (
    <>
      <Cabecalho titulo="Minha assinatura" />
      {sp.retorno && (
        <div className="mb-4">
          <Aviso tom="verde">Recebemos seu retorno do Mercado Pago. A confirmação pode levar alguns minutos.</Aviso>
        </div>
      )}
      <Cartao className="mb-8 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-tinta-3">Plano atual</p>
          <p className="font-display text-lg">{atual.nome}</p>
        </div>
        <Selo tom={situacao.tom} className="text-sm">
          {situacao.texto}
        </Selo>
      </Cartao>

      {!configurado && (
        <div className="mb-4">
          <Aviso tom="ambar">A cobrança automática ainda não foi configurada pelo administrador da plataforma.</Aviso>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANOS.map((p) => {
          const eAtual = p.id === atual.id && empresa.status_assinatura === "ativa";
          return (
            <Cartao key={p.id} className={cx("flex flex-col p-5", p.id === atual.id && "ring-2 ring-agua-600")}>
              <h3 className="font-semibold">{p.nome}</h3>
              <p className="mt-2">
                <span className="font-display text-2xl tabular">{moeda(p.preco_centavos)}</span>
                <span className="text-tinta-3"> /mês</span>
              </p>
              <p className="text-sm text-tinta-3">{p.usuarios}</p>
              <ul className="my-5 flex-1 space-y-2 text-sm">
                {p.recursos.map((r) => (
                  <li key={r} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-espuma" aria-hidden /> {r}
                  </li>
                ))}
              </ul>
              <form action={assinarPlataforma.bind(null, p.id)}>
                <BotaoEnviar className="w-full" variante={eAtual ? "secundario" : "primario"} disabled={eAtual || !configurado} pendente="Abrindo…">
                  {eAtual ? "Seu plano" : "Assinar"}
                </BotaoEnviar>
              </form>
            </Cartao>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-tinta-3">Cobrança mensal no cartão pelo Mercado Pago. Cancele quando quiser pelo próprio Mercado Pago.</p>
    </>
  );
}
