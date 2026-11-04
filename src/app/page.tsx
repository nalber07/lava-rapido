import type { CSSProperties } from "react";
import Link from "next/link";
import { CalendarCheck, Check, CreditCard, MessageCircle, ShoppingBag, Stamp, Wallet } from "lucide-react";
import { Marca } from "@/components/marca";
import { BotaoLink, cx } from "@/components/ui";
import { PLANOS } from "@/lib/planos";
import { moeda } from "@/lib/format";

const recursos = [
  { icone: CalendarCheck, titulo: "Agenda que se preenche sozinha", texto: "O cliente escolhe serviço e horário pelo seu link. Sem ligação e sem dois carros na mesma vaga." },
  { icone: CreditCard, titulo: "Pix e cartão antes da lavagem", texto: "Pagamento pelo Mercado Pago, direto na sua conta. Quem preferir paga no balcão." },
  { icone: Wallet, titulo: "Caixa sem planilha", texto: "Lavagens pagas e vendas entram sozinhas. Você lança as despesas e vê o lucro do mês." },
  { icone: ShoppingBag, titulo: "Loja no balcão", texto: "Venda cheirinho, cera e pretinho para o cliente levar quando buscar o carro." },
  { icone: Stamp, titulo: "Cliente que volta", texto: "Cartão fidelidade com selos automáticos e planos mensais de lavagem por assinatura." },
  { icone: MessageCircle, titulo: "Carro pronto no WhatsApp", texto: "Um toque abre a conversa com a mensagem pronta e as fotos de antes e depois." },
];

const passos = [
  { titulo: "Abre o seu link", texto: "Você divulga no Instagram, no WhatsApp ou num QR code no balcão." },
  { titulo: "Escolhe serviço e horário", texto: "Só aparecem os horários livres, do jeito que você configurou." },
  { titulo: "Paga ou reserva", texto: "Pix, cartão ou pagamento no local." },
  { titulo: "Recebe o aviso", texto: "Quando o carro fica pronto, chega mensagem no WhatsApp." },
];

export default function Inicio() {
  return (
    <div className="bg-fundo">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <Marca />
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Conta">
          <Link href="/entrar" className="inline-flex h-11 items-center rounded-lg px-3 text-[15px] font-medium text-tinta-2 hover:text-tinta">
            Entrar
          </Link>
          <BotaoLink href="/cadastro" tamanho="sm" variante="sinal">
            Testar grátis
          </BotaoLink>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-10 pt-8 md:pt-14">
          <h1 className="max-w-[14ch] font-display text-[52px] font-extrabold leading-[0.92] tracking-[-0.015em] text-tinta sm:text-7xl md:text-[96px]">
            Seu lava rápido com a agenda cheia e o caixa em dia
          </h1>
          <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,34rem)_1fr] md:items-end">
            <p className="text-lg leading-relaxed text-tinta-2 md:text-xl">
              O cliente agenda e paga pelo celular. Você acompanha cada carro da entrada até a entrega, com serviços,
              loja, equipe e financeiro no mesmo app.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <BotaoLink href="/cadastro" tamanho="lg" variante="sinal">
                Começar 14 dias grátis
              </BotaoLink>
              <BotaoLink href="#planos" tamanho="lg" variante="secundario">
                Ver planos
              </BotaoLink>
            </div>
          </div>
        </section>

        <Pista />

        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28" aria-labelledby="como-agenda">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <h2 id="como-agenda" className="font-display text-4xl font-bold leading-none text-tinta md:text-5xl">
                Como o seu cliente agenda
              </h2>
              <p className="mt-4 max-w-sm text-tinta-2">
                Cada lava rápido ganha uma página própria, com o seu nome, seus serviços e seus preços.
              </p>
              <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-superficie px-3 py-2 text-sm text-tinta-2 shadow-cartao">
                <span className="text-tinta-3">seu link:</span>
                <span className="font-semibold text-tinta">/l/brilho-car</span>
              </p>
            </div>
            <ol className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {passos.map((p, i) => (
                <li key={p.titulo} className="relative border-t-2 border-tinta pt-4">
                  <span className="font-display text-5xl font-extrabold leading-none text-agua-600 tabular">{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold text-tinta">{p.titulo}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-tinta-2">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-superficie" aria-labelledby="no-balcao">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <h2 id="no-balcao" className="max-w-xl font-display text-4xl font-bold leading-none text-tinta md:text-5xl">
              O que fica nas suas mãos
            </h2>
            <ul className="mt-12 grid border-t border-borda sm:grid-cols-2 lg:grid-cols-3">
              {recursos.map((r) => (
                <li key={r.titulo} className="flex gap-4 border-b border-borda py-7 sm:pr-8">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-agua-50 text-agua-600">
                    <r.icone className="size-[22px]" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold text-tinta">{r.titulo}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-tinta-2">{r.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="planos" className="mx-auto max-w-6xl scroll-mt-6 px-5 py-20 md:py-28" aria-labelledby="titulo-planos">
          <h2 id="titulo-planos" className="font-display text-4xl font-bold leading-none text-tinta md:text-5xl">
            Planos
          </h2>
          <p className="mt-3 text-lg text-tinta-2">14 dias grátis em qualquer plano. Cancele quando quiser.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:items-stretch">
            {PLANOS.map((p) => {
              const destaque = "destaque" in p && p.destaque;
              return (
                <div
                  key={p.id}
                  className={cx(
                    "flex flex-col rounded-[1.25rem] p-6 md:p-7",
                    destaque ? "escuro bg-agua-900 text-white shadow-flutuante" : "border border-borda bg-superficie",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl font-bold">{p.nome}</h3>
                    {destaque && (
                      <span className="rounded-full bg-sinal px-2.5 py-0.5 text-xs font-semibold text-tinta">Mais escolhido</span>
                    )}
                  </div>
                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-extrabold tabular">{moeda(p.preco_centavos)}</span>
                    <span className={destaque ? "text-agua-200" : "text-tinta-3"}>/mês</span>
                  </p>
                  <p className={cx("mt-1 text-sm", destaque ? "text-agua-200" : "text-tinta-3")}>{p.usuarios}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-[15px]">
                    {p.recursos.map((r) => (
                      <li key={r} className="flex gap-2.5">
                        <Check className={cx("mt-0.5 size-4 shrink-0", destaque ? "text-sinal" : "text-espuma")} aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <BotaoLink
                    href={`/cadastro?plano=${p.id}`}
                    variante={destaque ? "sinal" : "secundario"}
                    className="mt-7"
                  >
                    Começar grátis no {p.nome}
                  </BotaoLink>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-sinal">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-4xl font-extrabold leading-none text-tinta md:text-6xl">
                Teste por 14 dias, sem cartão
              </p>
              <p className="mt-3 text-lg text-tinta">Sua página de agendamento fica pronta no cadastro.</p>
            </div>
            <BotaoLink href="/cadastro" tamanho="lg" variante="tinta" className="shrink-0">
              Cadastrar meu lava rápido
            </BotaoLink>
          </div>
        </section>
      </main>

      <footer className="escuro bg-agua-900 text-agua-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Marca claro />
          <p>Agenda e gestão para lava rápido.</p>
        </div>
      </footer>
    </div>
  );
}

/** A pista: o dia do lava rápido visto como as faixas de um túnel de lavagem. */
function Pista() {
  const etapas = ["Chegou", "Lavando", "Pronto"] as const;
  const carros = [
    { placa: "BRA2E19", carro: "Onix prata", servico: "Lavagem completa", hora: "08:30", etapa: 2 },
    { placa: "QWE4R56", carro: "HB20 branco", servico: "Lavagem simples", hora: "09:00", etapa: 1 },
    { placa: "JKL7M89", carro: "Compass preto", servico: "Polimento", hora: "10:00", etapa: 0 },
  ];
  return (
    <section className="px-3 sm:px-5" aria-label="Exemplo da agenda do dia">
      <div className="escuro relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-agua-900 text-white shadow-flutuante">
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-5 pt-6 md:px-8">
          <div>
            <p className="text-sm text-agua-200">Hoje, terça</p>
            <p className="font-display text-3xl font-bold">14 carros na agenda</p>
          </div>
          <p className="font-display text-3xl font-bold tabular text-sinal">R$ 1.240</p>
        </div>

        <div className="hidden grid-cols-3 border-y border-white/10 px-8 text-sm text-agua-200 md:grid">
          {etapas.map((e) => (
            <p key={e} className="py-2.5">
              {e}
            </p>
          ))}
        </div>

        <ul>
          {carros.map((c, i) => (
            <li key={c.placa} className="relative border-b-2 border-dashed border-sinal/40 last:border-b-0">
              <div className="grid px-5 py-5 md:grid-cols-3 md:px-8">
                <div
                  className="animate-pista flex items-center gap-4 md:[grid-column-start:var(--coluna)]"
                  style={{ "--coluna": c.etapa + 1, animationDelay: `${200 + i * 140}ms` } as CSSProperties}
                >
                  <span className="placa text-[22px] md:text-2xl">
                    <span>{c.placa}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {c.hora} <span className="font-normal text-agua-200">{c.carro}</span>
                    </p>
                    <p className="truncate text-sm text-agua-200">{c.servico}</p>
                    <span
                      className={cx(
                        "mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold md:hidden",
                        c.etapa === 2 ? "bg-espuma-50 text-espuma-700" : c.etapa === 1 ? "bg-sinal text-tinta" : "bg-white/15 text-white",
                      )}
                    >
                      {etapas[c.etapa]}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
