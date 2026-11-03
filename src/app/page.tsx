import Link from "next/link";
import { CalendarCheck, Check, CreditCard, Droplets, MessageCircle, ShoppingBag, Smartphone, Stamp, Wallet } from "lucide-react";
import { Marca } from "@/components/marca";
import { BotaoLink, cx } from "@/components/ui";
import { PLANOS } from "@/lib/planos";
import { moeda } from "@/lib/format";

const recursos = [
  { icone: CalendarCheck, titulo: "Agenda que se preenche sozinha", texto: "Seus clientes escolhem serviço e horário pelo link do seu lava rápido. Sem ligação, sem conflito de vaga." },
  { icone: CreditCard, titulo: "Pix e cartão na hora de agendar", texto: "Receba antes da lavagem pelo Mercado Pago. O dinheiro cai direto na sua conta." },
  { icone: Wallet, titulo: "Financeiro sem planilha", texto: "Cada lavagem paga e cada venda entram no caixa automaticamente. Lance despesas e veja o lucro do mês." },
  { icone: ShoppingBag, titulo: "Loja de produtos", texto: "Venda cheirinho, cera e acessórios para o cliente retirar quando buscar o carro." },
  { icone: Stamp, titulo: "Fidelidade e planos mensais", texto: "Cartão fidelidade automático e planos de lavagem por assinatura para garantir receita todo mês." },
  { icone: MessageCircle, titulo: "Avise que o carro ficou pronto", texto: "Um toque e o WhatsApp abre com a mensagem pronta, com fotos de antes e depois no app." },
];

export default function Inicio() {
  return (
    <div className="bg-superficie">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Marca />
        <nav className="flex items-center gap-2">
          <Link href="/entrar" className="px-3 py-2 text-sm font-medium text-tinta-2 hover:text-tinta">
            Entrar
          </Link>
          <BotaoLink href="/cadastro" tamanho="sm">
            Testar grátis
          </BotaoLink>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-16">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-agua-50 px-3 py-1 text-sm font-medium text-agua-700">
              <Smartphone className="size-4" aria-hidden /> Feito para usar no celular
            </p>
            <h1 className="font-display text-[40px] font-semibold leading-[1.05] tracking-tight text-tinta md:text-6xl">
              Seu lava rápido com a agenda cheia e o caixa em dia.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-tinta-2">
              Clientes agendam e pagam pelo celular. Você controla serviços, produtos, equipe e financeiro num lugar só.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BotaoLink href="/cadastro" tamanho="lg">
                Começar 14 dias grátis
              </BotaoLink>
              <BotaoLink href="#planos" tamanho="lg" variante="secundario">
                Ver planos
              </BotaoLink>
            </div>
            <p className="mt-3 text-sm text-tinta-3">Sem cartão de crédito para testar.</p>
          </div>

          <MockCelular />
        </div>
      </section>

      <section className="border-y border-borda bg-fundo">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Tudo o que o dono precisa, sem complicação
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((r) => (
              <div key={r.titulo}>
                <r.icone className="size-6 text-agua-600" aria-hidden />
                <h3 className="mt-3 font-semibold text-tinta">{r.titulo}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-tinta-2">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-16 md:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Planos</h2>
        <p className="mt-2 text-tinta-2">14 dias grátis em qualquer plano. Cancele quando quiser.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLANOS.map((p) => (
            <div
              key={p.id}
              className={cx(
                "flex flex-col rounded-cartao border p-6",
                "destaque" in p && p.destaque ? "border-agua-600 ring-1 ring-agua-600" : "border-borda",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.nome}</h3>
                {"destaque" in p && p.destaque && (
                  <span className="rounded-full bg-agua-600 px-2.5 py-0.5 text-xs font-medium text-white">Mais escolhido</span>
                )}
              </div>
              <p className="mt-4">
                <span className="font-display text-4xl font-semibold tabular">{moeda(p.preco_centavos)}</span>
                <span className="text-tinta-3"> /mês</span>
              </p>
              <p className="mt-1 text-sm text-tinta-3">{p.usuarios}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-[15px]">
                {p.recursos.map((r) => (
                  <li key={r} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-espuma" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
              <BotaoLink
                href={`/cadastro?plano=${p.id}`}
                variante={"destaque" in p && p.destaque ? "primario" : "secundario"}
                className="mt-6"
              >
                Começar grátis
              </BotaoLink>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-borda">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-tinta-3 sm:flex-row sm:items-center sm:justify-between">
          <Marca />
          <p>Agenda e gestão para lava rápidos.</p>
        </div>
      </footer>
    </div>
  );
}

function MockCelular() {
  const itens = [
    { hora: "08:30", carro: "Onix prata · BRA2E19", servico: "Lavagem completa", status: "Pronto", cor: "bg-espuma-50 text-[#0b7a5a]" },
    { hora: "09:00", carro: "HB20 branco · QWE4R56", servico: "Lavagem simples", status: "Em lavagem", cor: "bg-ambar-50 text-[#8a5800]" },
    { hora: "10:00", carro: "Compass preto · JKL7M89", servico: "Polimento", status: "Agendado", cor: "bg-agua-50 text-agua-700" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-[340px]" aria-hidden>
      <div className="absolute -inset-10 -z-10 rounded-full bg-agua-100 blur-3xl" />
      <div className="rounded-[2.5rem] border-[10px] border-tinta bg-fundo p-4 shadow-flutuante">
        <div className="flex items-center justify-between pb-3">
          <span className="font-display font-semibold">Hoje</span>
          <Droplets className="size-5 text-agua-600" />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-superficie p-3">
            <p className="text-xs text-tinta-3">Faturamento</p>
            <p className="font-display text-lg font-semibold tabular">R$ 1.240</p>
          </div>
          <div className="rounded-xl bg-superficie p-3">
            <p className="text-xs text-tinta-3">Carros</p>
            <p className="font-display text-lg font-semibold tabular">14</p>
          </div>
        </div>
        <div className="space-y-2">
          {itens.map((i) => (
            <div key={i.hora} className="rounded-xl bg-superficie p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tabular">{i.hora}</span>
                <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-medium", i.cor)}>{i.status}</span>
              </div>
              <p className="mt-1 text-sm">{i.servico}</p>
              <p className="text-xs text-tinta-3">{i.carro}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
