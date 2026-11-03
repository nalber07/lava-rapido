import Link from "next/link";
import { Clock, MapPin, MessageCircle, Stamp } from "lucide-react";
import { getEmpresaPorSlug } from "@/lib/vitrine";
import { createClient } from "@/lib/supabase/server";
import { BotaoLink, Cartao, Secao, classeBotao } from "@/components/ui";
import { linkWhatsApp, moeda } from "@/lib/format";
import type { PlanoCliente, Produto, Servico } from "@/lib/types";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function resumoDias(dias: number[]) {
  const ord = [...dias].sort();
  if (ord.join() === "1,2,3,4,5,6") return "Seg a Sáb";
  if (ord.join() === "1,2,3,4,5") return "Seg a Sex";
  if (ord.length === 7) return "Todos os dias";
  return ord.map((d) => DIAS[d]).join(", ");
}

export default async function Vitrine({ params }: PageProps<"/l/[slug]">) {
  const { slug } = await params;
  const e = await getEmpresaPorSlug(slug);
  const supabase = await createClient();
  const [{ data: servicos }, { data: produtos }, { data: planos }] = await Promise.all([
    supabase.from("servicos").select("*").eq("empresa_id", e.id).eq("ativo", true).order("ordem"),
    supabase.from("produtos").select("*").eq("empresa_id", e.id).eq("ativo", true).gt("estoque", 0).order("nome").limit(4),
    supabase.from("planos_cliente").select("*, servicos(nome)").eq("empresa_id", e.id).eq("ativo", true).order("preco_centavos"),
  ]);

  return (
    <>
      <section className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{e.nome}</h1>
        {e.descricao && <p className="mt-2 text-tinta-2">{e.descricao}</p>}
        <ul className="mt-4 space-y-1.5 text-sm text-tinta-2">
          <li className="flex items-center gap-2">
            <Clock className="size-4 text-tinta-3" aria-hidden /> {resumoDias(e.dias_funcionamento)}, {e.abre.slice(0, 5)} às {e.fecha.slice(0, 5)}
          </li>
          {(e.endereco || e.cidade) && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-tinta-3" aria-hidden />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.endereco, e.cidade].filter(Boolean).join(", "))}`}
                target="_blank"
                className="underline decoration-borda-forte underline-offset-2"
              >
                {[e.endereco, e.cidade].filter(Boolean).join(", ")}
              </a>
            </li>
          )}
        </ul>
        <div className="mt-5 flex gap-2">
          <BotaoLink href={`/l/${slug}/agendar`} tamanho="lg" className="flex-1 sm:flex-none">
            Agendar lavagem
          </BotaoLink>
          {e.whatsapp && (
            <a href={linkWhatsApp(e.whatsapp, `Olá! Vim pela página do ${e.nome}.`)} target="_blank" className={classeBotao("secundario", "lg")} aria-label="Falar no WhatsApp">
              <MessageCircle className="size-5 text-espuma" aria-hidden />
            </a>
          )}
        </div>
      </section>

      <Secao titulo="Serviços">
        <Cartao className="divide-y divide-borda overflow-hidden">
          {((servicos ?? []) as Servico[]).map((s) => (
            <Link key={s.id} href={`/l/${slug}/agendar?servico=${s.id}`} className="flex items-center gap-4 px-4 py-4 hover:bg-fundo">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.nome}</p>
                <p className="text-sm text-tinta-3">
                  {s.duracao_minutos} min{s.descricao && ` · ${s.descricao}`}
                </p>
              </div>
              <span className="font-semibold tabular">{moeda(s.preco_centavos)}</span>
            </Link>
          ))}
        </Cartao>
      </Secao>

      {e.fidelidade_ativa && (
        <div className="mb-8 flex items-center gap-3 rounded-cartao bg-agua-900 p-4 text-white">
          <Stamp className="size-8 shrink-0 text-agua-200" aria-hidden />
          <p className="text-sm">
            <strong className="font-semibold">Cartão fidelidade:</strong> a cada {e.fidelidade_meta} lavagens, a próxima é grátis. Seus selos ficam em Minha conta.
          </p>
        </div>
      )}

      {(planos ?? []).length > 0 && (
        <Secao titulo="Planos mensais">
          <div className="grid gap-3 sm:grid-cols-2">
            {((planos ?? []) as (PlanoCliente & { servicos: { nome: string } | null })[]).map((p) => (
              <Cartao key={p.id} className="flex flex-col p-4">
                <p className="font-semibold">{p.nome}</p>
                <p className="mt-1 text-sm text-tinta-3">
                  {p.lavagens_mes}× {p.servicos?.nome} por mês
                </p>
                {p.descricao && <p className="mt-2 text-sm text-tinta-2">{p.descricao}</p>}
                <p className="mt-3 flex-1">
                  <span className="font-display text-2xl font-semibold tabular">{moeda(p.preco_centavos)}</span>
                  <span className="text-sm text-tinta-3"> /mês</span>
                </p>
                <BotaoLink href={`/l/${slug}/conta?assinar=${p.id}`} variante="secundario" className="mt-3">
                  Quero assinar
                </BotaoLink>
              </Cartao>
            ))}
          </div>
        </Secao>
      )}

      {(produtos ?? []).length > 0 && (
        <Secao titulo="Na loja" acao={<Link href={`/l/${slug}/loja`} className="text-sm font-medium text-agua-700">Ver tudo</Link>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {((produtos ?? []) as Produto[]).map((p) => (
              <Link key={p.id} href={`/l/${slug}/loja`} className="overflow-hidden rounded-cartao border border-borda bg-superficie">
                <div className="aspect-square bg-fundo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.foto_url && <img src={p.foto_url} alt="" className="size-full object-cover" loading="lazy" />}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{p.nome}</p>
                  <p className="text-sm font-semibold tabular">{moeda(p.preco_centavos)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Secao>
      )}
    </>
  );
}
