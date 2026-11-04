import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Camera,
  Check,
  CreditCard,
  MapPin,
  MessageCircle,
  Plus,
  QrCode,
  ShoppingBag,
  Smartphone,
  Stamp,
  Wallet,
  Zap,
} from "lucide-react";
import { Marca } from "@/components/marca";
import { AlternarTema } from "@/components/tema";
import { Holofotes } from "@/components/holofotes";
import { BotaoLink, cx } from "@/components/ui";
import { PLANOS } from "@/lib/planos";
import { moeda } from "@/lib/format";

const atraso = (ms: number) => ({ animationDelay: `${ms}ms` }) as CSSProperties;

export default function Inicio() {
  return (
    <div className="overflow-x-clip bg-fundo">
      <Holofotes />
      <Topo />

      <main>
        <Hero />
        <PainelProduto />
        <Integracoes />
        <Recursos />
        <ComoFunciona />
        <PistaDoDia />
        <Planos />
        <Duvidas />
        <Chamada />
      </main>

      <Rodape />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Topo() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3">
      <div className="animate-entra mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-borda bg-fundo/70 py-2 pl-5 pr-2 shadow-cartao backdrop-blur-xl">
        <Marca />
        <nav className="hidden items-center gap-1 text-sm font-medium text-tinta-2 md:flex" aria-label="Seções">
          {[
            ["#recursos", "Recursos"],
            ["#como-funciona", "Como funciona"],
            ["#planos", "Planos"],
            ["#duvidas", "Dúvidas"],
          ].map(([href, rotulo]) => (
            <a key={href} href={href} className="rounded-full px-3.5 py-2 transition-colors hover:bg-superficie hover:text-tinta">
              {rotulo}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <AlternarTema />
          <Link
            href="/entrar"
            className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-tinta-2 transition-colors hover:text-tinta sm:inline-flex"
          >
            Entrar
          </Link>
          <BotaoLink href="/cadastro" tamanho="sm">
            Testar grátis
          </BotaoLink>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-48 pt-36 md:pb-64 md:pt-44">
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_75%,transparent)]" aria-hidden>
        <div className="absolute left-1/2 top-24 size-[540px] -translate-x-1/2 rounded-full bg-ouro/15 blur-[120px]" />
        <div className="horizonte" />
        <div className="estrada" />
      </div>

      <div className="mx-auto max-w-4xl px-5 text-center">
        <p
          className="animate-entra mx-auto inline-flex items-center gap-2 rounded-full border border-borda bg-superficie px-3.5 py-1.5 text-[13px] font-medium text-tinta-2"
          style={atraso(100)}
        >
          <span className="animate-pulso size-2 rounded-full bg-ouro" aria-hidden />
          Agenda e gestão para lava rápido
        </p>
        <h1
          className="animate-entra mt-7 text-balance text-[44px] font-light leading-[1.02] tracking-[-0.04em] text-tinta sm:text-6xl md:text-[84px]"
          style={atraso(220)}
        >
          Agenda cheia, carro brilhando e caixa em dia
        </h1>
        <p
          className="animate-entra mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-tinta-2 md:text-lg"
          style={atraso(380)}
        >
          Seu cliente agenda e paga pelo celular. Você acompanha cada carro da chegada até a entrega, com loja, equipe e
          financeiro no mesmo app.
        </p>
        <div className="animate-entra mt-9 flex flex-col justify-center gap-3 sm:flex-row" style={atraso(520)}>
          <BotaoLink href="/cadastro" tamanho="lg">
            Começar 14 dias grátis
          </BotaoLink>
          <BotaoLink href="#como-funciona" tamanho="lg" variante="secundario">
            Ver como funciona
          </BotaoLink>
        </div>
        <p className="animate-entra mt-4 text-sm text-tinta-3" style={atraso(640)}>
          Sem cartão de crédito. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}

/* Mock do painel do dono: inclina e endireita com a rolagem. */
function PainelProduto() {
  const carros = [
    { hora: "08:30", placa: "BRA2E19", carro: "Onix prata", servico: "Lavagem completa", status: "Pronto", tom: "bg-espuma-50 text-espuma-700" },
    { hora: "09:00", placa: "QWE4R56", carro: "HB20 branco", servico: "Lavagem simples", status: "Lavando", tom: "bg-agua-50 text-agua-700" },
    { hora: "10:00", placa: "JKL7M89", carro: "Compass preto", servico: "Polimento", status: "Agendado", tom: "bg-superficie-2 text-tinta-2" },
    { hora: "10:30", placa: "RIO3B21", carro: "Corolla cinza", servico: "Higienização", status: "Agendado", tom: "bg-superficie-2 text-tinta-2" },
  ];
  const barras = [38, 52, 44, 70, 58, 86, 64];
  return (
    <section className="relative -mt-20 px-4 md:-mt-28" aria-label="Como fica o painel do dono">
      <div className="inclina chanfro metal mx-auto max-w-5xl rounded-[2rem] border border-borda bg-superficie p-3 shadow-flutuante md:p-4">
        <div className="flex items-center gap-1.5 px-2 pb-3" aria-hidden>
          <span className="size-2.5 rounded-full bg-borda-forte" />
          <span className="size-2.5 rounded-full bg-borda-forte" />
          <span className="size-2.5 rounded-full bg-borda-forte" />
          <span className="ml-3 truncate rounded-full bg-superficie-2 px-3 py-1 text-xs text-tinta-3">pista.app/painel</span>
        </div>
        <div className="grid gap-3 rounded-[1.5rem] bg-fundo p-3 md:grid-cols-[1.4fr_1fr] md:p-5">
          <div className="chanfro rounded-2xl border border-borda bg-superficie p-4 md:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-sm text-tinta">Agenda de hoje</p>
              <p className="text-xs text-tinta-3">terça, 4 de nov.</p>
            </div>
            <ul className="mt-4 divide-y divide-borda">
              {carros.map((c, i) => (
                <li key={c.placa} className="revela flex items-center gap-3 py-3" style={atraso(i * 80)}>
                  <span className="w-11 shrink-0 text-sm font-semibold tabular text-tinta">{c.hora}</span>
                  <span className="placa hidden shrink-0 text-[11px] sm:inline-flex">
                    <span>{c.placa}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-tinta">{c.servico}</p>
                    <p className="truncate text-xs text-tinta-3">{c.carro}</p>
                  </div>
                  <span className={cx("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", c.tom)}>{c.status}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Numero rotulo="Faturamento" valor="R$ 1.240" destaque />
              <Numero rotulo="Carros hoje" valor="14" />
            </div>
            <div className="chanfro rounded-2xl border border-borda bg-superficie p-4">
              <p className="text-xs text-tinta-3">Últimos 7 dias</p>
              <div className="mt-3 flex h-28 items-end gap-2" aria-hidden>
                {barras.map((b, i) => (
                  <div key={i} className="flex h-full flex-1 items-end rounded-t-md bg-superficie-2">
                    <div
                      className={cx("revela w-full rounded-t-md", i === barras.length - 2 ? "bg-ouro" : "bg-borda-forte")}
                      style={{ height: `${b}%`, ...atraso(i * 60) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Numero({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={cx("chanfro rounded-2xl p-4", destaque ? "bg-marinho text-white" : "border border-borda bg-superficie")}>
      <p className={cx("text-xs", destaque ? "text-agua-200" : "text-tinta-3")}>{rotulo}</p>
      <p className={cx("mt-1 whitespace-nowrap font-display text-base tabular sm:text-lg md:text-xl", destaque && "text-ouro")}>{valor}</p>
    </div>
  );
}

function Integracoes() {
  const itens = [
    { icone: Zap, nome: "Pix" },
    { icone: CreditCard, nome: "Mercado Pago" },
    { icone: MessageCircle, nome: "WhatsApp" },
    { icone: MapPin, nome: "Google Maps" },
    { icone: QrCode, nome: "QR code no balcão" },
    { icone: Smartphone, nome: "App no celular" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 pt-24 md:pt-32" aria-labelledby="integracoes">
      <h2 id="integracoes" className="revela text-center text-lg font-light text-tinta-2 md:text-xl">
        Funciona com o que você e seus clientes já usam
      </h2>
      <div className="faixa-mascara mt-8 overflow-hidden">
        <ul className="animate-faixa flex w-max gap-3">
          {[...itens, ...itens].map((it, i) => (
            <li
              key={i}
              aria-hidden={i >= itens.length}
              className="chanfro flex h-16 shrink-0 items-center gap-3 rounded-2xl border border-borda bg-superficie px-6 text-[15px] font-semibold text-tinta-2"
            >
              <it.icone className="size-5 text-agua-600" aria-hidden />
              {it.nome}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------ Recursos (bento) ------------------------------ */

function Titulo({ etiqueta, children, id }: { etiqueta: string; children: ReactNode; id: string }) {
  return (
    <div className="revela text-center">
      <p className="inline-flex rounded-full border border-borda bg-superficie px-3.5 py-1 text-[13px] font-medium text-tinta-2">
        {etiqueta}
      </p>
      <h2 id={id} className="mx-auto mt-5 max-w-3xl text-4xl font-light leading-[1.08] tracking-[-0.035em] text-tinta md:text-6xl">
        {children}
      </h2>
    </div>
  );
}

function Bloco({
  icone: Icone,
  titulo,
  texto,
  children,
  className,
}: {
  icone: typeof Wallet;
  titulo: string;
  texto: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cx(
        "revela holofote chanfro metal flex flex-col overflow-hidden rounded-[1.75rem] border border-borda bg-superficie p-6 transition-colors duration-300 hover:border-borda-forte",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-borda bg-superficie-2 text-agua-600">
          <Icone className="size-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-[17px] font-semibold text-tinta">{titulo}</h3>
          <p className="mt-1 max-w-md text-pretty text-[15px] leading-relaxed text-tinta-2">{texto}</p>
        </div>
      </div>
      <div className="relative mt-6 flex flex-1 items-end" aria-hidden>
        {children}
      </div>
    </article>
  );
}

function Recursos() {
  const horas = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"];
  const ocupados = new Set([1, 4, 9]);
  const reservando = [2, 6, 10];
  return (
    <section id="recursos" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:py-36" aria-labelledby="titulo-recursos">
      <Titulo etiqueta="Recursos" id="titulo-recursos">
        Tudo o que acontece no seu lava rápido, num lugar só
      </Titulo>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        <Bloco
          icone={CalendarCheck}
          titulo="Agenda que se preenche sozinha"
          texto="O cliente escolhe serviço e horário pelo seu link. Só aparecem as vagas livres, sem dois carros no mesmo horário."
          className="md:col-span-2"
        >
          <div className="grid w-full grid-cols-4 gap-2 sm:grid-cols-6">
            {horas.map((h, i) => {
              const ordem = reservando.indexOf(i);
              return (
                <span
                  key={h}
                  className={cx(
                    "rounded-xl border py-2.5 text-center text-xs font-semibold tabular",
                    ocupados.has(i) ? "border-tinta bg-tinta text-fundo" : "border-borda bg-superficie-2 text-tinta-3",
                    ordem >= 0 && "reserva",
                  )}
                  style={ordem >= 0 ? atraso(ordem * 2000) : undefined}
                >
                  {h}
                </span>
              );
            })}
          </div>
        </Bloco>

        <Bloco icone={Zap} titulo="Pix na hora de agendar" texto="Pagamento pelo Mercado Pago, direto na sua conta.">
          <div className="chanfro w-full rounded-2xl bg-fundo p-4">
            <div className="flex items-center gap-3">
              <span className="animate-pulso grid size-10 place-items-center rounded-full bg-ouro text-black">
                <Check className="size-5" strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm font-semibold text-tinta">Pagamento aprovado</p>
                <p className="text-xs text-tinta-3">Lavagem completa, 08:30</p>
              </div>
            </div>
            <p className="mt-4 font-display text-2xl tabular text-tinta">R$ 60,00</p>
          </div>
        </Bloco>

        <Bloco icone={Stamp} titulo="Cliente que volta" texto="Cartão fidelidade com selos automáticos.">
          <div className="w-full">
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className="aspect-square rounded-full border-2 border-ouro/70"
                  style={{ animation: "selo 9s ease-out infinite", animationDelay: `${i * 0.7}s` }}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-tinta-2">
              A cada 10 lavagens, <span className="font-semibold text-tinta">a próxima é grátis</span>.
            </p>
          </div>
        </Bloco>

        <Bloco
          icone={Wallet}
          titulo="Caixa sem planilha"
          texto="Lavagens pagas e vendas da loja entram sozinhas. Lance as despesas e veja o lucro do mês."
          className="md:col-span-2"
        >
          <div className="w-full">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-display text-2xl tabular text-tinta">R$ 18.430</p>
              <p className="text-sm font-semibold text-espuma-700">+12% no mês</p>
            </div>
            <svg viewBox="0 0 600 140" className="h-32 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-ouro" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#fca311" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#fca311" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 120 C60 110 90 80 150 88 S240 60 300 66 S390 30 450 40 S540 12 600 10 L600 140 L0 140 Z"
                fill="url(#area-ouro)"
                className="revela"
              />
              <path
                d="M0 120 C60 110 90 80 150 88 S240 60 300 66 S390 30 450 40 S540 12 600 10"
                fill="none"
                stroke="#fca311"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                className="desenha"
              />
            </svg>
          </div>
        </Bloco>

        <Bloco icone={MessageCircle} titulo="Carro pronto no WhatsApp" texto="Um toque e a mensagem sai pronta.">
          <div className="chanfro w-full rounded-2xl bg-fundo p-4">
            <div className="relative h-16">
              <div className="absolute left-0 top-0 flex gap-1 rounded-2xl rounded-tl-sm bg-superficie-2 px-3.5 py-3" style={{ animation: "some 7s infinite" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 rounded-full bg-tinta-3" style={{ animation: "digita 1s infinite", animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
              <p
                className="absolute left-0 top-0 max-w-[16rem] rounded-2xl rounded-tl-sm bg-espuma px-3.5 py-2 text-sm font-semibold text-black"
                style={{ animation: "chega 7s infinite" }}
              >
                Seu Onix está pronto para retirada!
              </p>
            </div>
          </div>
        </Bloco>

        <Bloco
          icone={Camera}
          titulo="Fotos de antes e depois"
          texto="O cliente acompanha o carro pelo celular e vê o resultado antes de buscar."
          className="md:col-span-2"
        >
          <AntesDepois />
        </Bloco>

        <Bloco
          icone={ShoppingBag}
          titulo="Loja no balcão"
          texto="Cheirinho, cera e pretinho para o cliente levar quando buscar o carro."
          className="md:col-span-3"
        >
          <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Cheirinho", "R$ 12,90"],
              ["Cera líquida", "R$ 39,90"],
              ["Pretinho", "R$ 24,90"],
              ["Flanela", "R$ 9,90"],
            ].map(([nome, preco], i) => (
              <li
                key={nome}
                className="revela chanfro flex items-center justify-between gap-2 rounded-2xl border border-borda bg-fundo px-4 py-3"
                style={atraso(i * 80)}
              >
                <span className="truncate text-sm font-semibold text-tinta">{nome}</span>
                <span className="shrink-0 text-sm tabular text-tinta-2">{preco}</span>
              </li>
            ))}
          </ul>
        </Bloco>
      </div>
    </section>
  );
}

/* A "lavagem" varre a foto do carro sujo para o limpo. */
function AntesDepois() {
  const carro = (
    <svg viewBox="0 0 400 120" className="h-full w-full" fill="none">
      <path
        d="M30 88c0-12 8-20 22-22l46-6 40-28c10-7 22-10 34-10h70c14 0 26 5 36 14l32 26 44 6c16 2 26 12 26 26v8c0 6-4 10-10 10H40c-6 0-10-4-10-10z"
        fill="currentColor"
      />
      <circle cx="104" cy="104" r="17" fill="#000" stroke="#555" strokeWidth="5" />
      <circle cx="300" cy="104" r="17" fill="#000" stroke="#555" strokeWidth="5" />
      <path d="M150 58l26-20c6-4 12-6 19-6h40v26zM250 32h32c8 0 15 3 20 9l15 17h-67z" fill="#9fb4d4" opacity=".8" />
    </svg>
  );
  return (
    <div className="chanfro relative h-40 w-full overflow-hidden rounded-2xl border border-borda bg-fundo">
      <div className="absolute inset-0 flex items-center justify-center p-6 text-[#6b5a43]">
        <div className="relative h-full w-full max-w-md">
          {carro}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgb(90_70_40/0.55)_0_6px,transparent_7px),radial-gradient(circle_at_62%_40%,rgb(90_70_40/0.5)_0_5px,transparent_6px),radial-gradient(circle_at_78%_70%,rgb(90_70_40/0.5)_0_8px,transparent_9px)]" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-fundo p-6 text-tinta" style={{ animation: "varre 6s ease-in-out infinite" }}>
        <div className="relative h-full w-full max-w-md">{carro}</div>
      </div>
      <div
        className="absolute inset-y-0 w-0.5 bg-ouro shadow-[0_0_24px_4px_rgb(252_163_17/0.6)]"
        style={{ animation: "varre-linha 6s ease-in-out infinite" }}
      />
      <span className="absolute left-3 top-3 rounded-full bg-superficie px-2.5 py-0.5 text-xs font-semibold text-tinta-2">Antes</span>
      <span className="absolute right-3 top-3 rounded-full bg-ouro px-2.5 py-0.5 text-xs font-semibold text-black">Depois</span>
    </div>
  );
}

/* ------------------------------ Como funciona ------------------------------ */

function ComoFunciona() {
  const passos = [
    { titulo: "Abre o seu link", texto: "Divulgue no Instagram, no WhatsApp ou num QR code no balcão." },
    { titulo: "Escolhe serviço e horário", texto: "Só aparecem as vagas livres, do jeito que você configurou." },
    { titulo: "Paga ou reserva", texto: "Pix, cartão ou pagamento no local." },
    { titulo: "Recebe o aviso", texto: "Quando o carro fica pronto, chega mensagem no WhatsApp." },
  ];
  return (
    <section id="como-funciona" className="scroll-mt-24 border-y border-borda bg-superficie" aria-labelledby="titulo-como">
      <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <Titulo etiqueta="Como funciona" id="titulo-como">
          Do link ao carro pronto em quatro passos
        </Titulo>
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <span className="absolute left-0 right-0 top-6 hidden h-px bg-borda md:block" aria-hidden />
          <span className="preenche absolute left-0 right-0 top-6 hidden h-px bg-ouro md:block" aria-hidden />
          {passos.map((p, i) => (
            <li key={p.titulo} className="revela relative" style={atraso(i * 100)}>
              <span className="relative grid size-12 place-items-center rounded-full border border-borda-forte bg-superficie font-display text-sm text-tinta">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-tinta">{p.titulo}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-tinta-2">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------ Pista do dia ------------------------------ */

function PistaDoDia() {
  const carros = [
    { placa: "BRA2E19", carro: "Onix prata", atraso: 0 },
    { placa: "QWE4R56", carro: "HB20 branco", atraso: 3 },
    { placa: "JKL7M89", carro: "Compass preto", atraso: 6 },
  ];
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-[1fr_1.25fr] md:py-36" aria-labelledby="titulo-pista">
      <div className="revela">
        <h2 id="titulo-pista" className="text-4xl font-light leading-[1.08] tracking-[-0.035em] text-tinta md:text-5xl">
          Cada carro, da chegada até a entrega
        </h2>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-tinta-2">
          Sua equipe muda o status com um toque. O cliente acompanha pelo celular e recebe o aviso quando estiver pronto.
        </p>
        <BotaoLink href="/cadastro" variante="tinta" className="mt-8">
          Criar minha agenda
        </BotaoLink>
      </div>

      <div className="revela chanfro metal relative overflow-hidden rounded-[2rem] border border-white/10 bg-marinho p-5 text-white shadow-flutuante md:p-7">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-ouro/20 blur-3xl" aria-hidden />
        <div className="relative grid grid-cols-3 text-xs text-agua-200">
          <p>Chegou</p>
          <p>Lavando</p>
          <p>Pronto</p>
        </div>
        <ul className="relative mt-3 space-y-3" aria-label="Carros na pista">
          {carros.map((c) => (
            <li key={c.placa} className="relative h-16 overflow-hidden rounded-2xl border border-dashed border-white/15">
              <div
                className="absolute inset-y-0 left-0 flex w-1/3 items-center gap-2.5 px-3"
                style={
                  {
                    "--p1": "0%",
                    "--p2": "100%",
                    "--p3": "200%",
                    animation: "avanca 9s cubic-bezier(0.65, 0, 0.35, 1) infinite",
                    animationDelay: `${c.atraso}s`,
                  } as CSSProperties
                }
              >
                <span className="placa shrink-0 text-[12px]">
                  <span>{c.placa}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
          <span className="text-agua-200">Hoje</span>
          <span className="font-display tabular text-ouro">14 carros</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Planos ------------------------------ */

function Planos() {
  return (
    <section id="planos" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:py-32" aria-labelledby="titulo-planos">
      <Titulo etiqueta="Planos" id="titulo-planos">
        14 dias grátis em qualquer plano
      </Titulo>
      <div className="mt-14 grid gap-4 md:grid-cols-3 md:items-stretch">
        {PLANOS.map((p, i) => {
          const destaque = "destaque" in p && p.destaque;
          return (
            <div
              key={p.id}
              className={cx(
                "revela holofote chanfro flex flex-col rounded-[1.75rem] p-7",
                destaque ? "borda-viva bg-marinho text-white shadow-flutuante md:-my-4 md:py-11" : "metal border border-borda bg-superficie",
              )}
              style={atraso(i * 100)}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-base">{p.nome}</h3>
                {destaque && <span className="rounded-full bg-ouro px-2.5 py-0.5 text-xs font-semibold text-black">Mais escolhido</span>}
              </div>
              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl tabular tracking-tight">{moeda(p.preco_centavos)}</span>
                <span className={destaque ? "text-agua-200" : "text-tinta-3"}>/mês</span>
              </p>
              <p className={cx("mt-1 text-sm", destaque ? "text-agua-200" : "text-tinta-3")}>{p.usuarios}</p>
              <ul className="mt-7 flex-1 space-y-3 text-[15px]">
                {p.recursos.map((r) => (
                  <li key={r} className="flex gap-2.5">
                    <Check className={cx("mt-0.5 size-4 shrink-0", destaque ? "text-ouro" : "text-agua-600")} strokeWidth={2.5} aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
              <BotaoLink
                href={`/cadastro?plano=${p.id}`}
                variante={destaque ? "primario" : "secundario"}
                className="mt-8"
              >
                Começar com o {p.nome}
              </BotaoLink>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------ Dúvidas ------------------------------ */

function Duvidas() {
  const itens = [
    ["Preciso de cartão de crédito para testar?", "Não. Você usa tudo por 14 dias e só escolhe um plano se quiser continuar."],
    [
      "Como recebo os pagamentos dos clientes?",
      "Você conecta a sua conta do Mercado Pago em Configurações. Pix e cartão caem direto nela, sem passar pela Pista.",
    ],
    ["Meu cliente precisa baixar aplicativo?", "Não. Ele agenda pelo navegador do celular, no link do seu lava rápido."],
    ["Minha equipe pode usar?", "Sim. Funcionários acessam a agenda e mudam o status dos carros, sem ver o financeiro."],
    ["Posso cancelar quando quiser?", "Pode. Sem multa e sem fidelidade. Seus dados continuam disponíveis para consulta."],
  ];
  return (
    <section id="duvidas" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-5 py-24 md:grid-cols-[1fr_1.4fr] md:py-32" aria-labelledby="titulo-duvidas">
      <div className="revela">
        <h2 id="titulo-duvidas" className="text-4xl font-light leading-[1.08] tracking-[-0.035em] text-tinta md:text-5xl">
          Dúvidas que todo dono tem
        </h2>
        <p className="mt-5 max-w-sm text-pretty text-tinta-2">O teste de 14 dias libera tudo, então dá para conferir cada resposta na prática.</p>
      </div>
      <div className="revela divide-y divide-borda border-y border-borda">
        {itens.map(([q, r]) => (
          <details key={q} className="duvida group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-semibold text-tinta">
              {q}
              <span className="duvida-icone grid size-9 shrink-0 place-items-center rounded-full border border-borda-forte text-tinta-2 transition-all duration-300 group-hover:border-tinta-3">
                <Plus className="size-4" aria-hidden />
              </span>
            </summary>
            <p className="max-w-xl pb-6 pr-12 text-[15px] leading-relaxed text-tinta-2">{r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Chamada() {
  return (
    <section className="px-4 pb-24 md:pb-32">
      <div className="revela chanfro metal relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] bg-marinho px-6 py-16 text-center text-white md:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/2 top-full size-[900px] -translate-x-1/2 -translate-y-[18%] rounded-full border border-ouro/50 shadow-[0_-40px_140px_-30px_rgb(252_163_17/0.55)]" />
          <div className="animate-gira absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,transparent,rgb(252_163_17/0.12),transparent_40%)]" />
        </div>
        <h2 className="relative mx-auto max-w-2xl text-balance text-4xl font-light leading-[1.08] tracking-[-0.035em] md:text-6xl">
          Coloque seu lava rápido na pista
        </h2>
        <p className="relative mx-auto mt-5 max-w-md text-balance text-agua-200">Sua página de agendamento fica pronta no cadastro. Teste 14 dias, sem cartão.</p>
        <div className="relative mt-9 flex justify-center">
          <BotaoLink href="/cadastro" tamanho="lg">
            Cadastrar meu lava rápido
          </BotaoLink>
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="px-4 pb-6">
      <div className="chanfro mx-auto grid max-w-6xl gap-10 rounded-[2rem] border border-borda bg-superficie p-8 md:grid-cols-[1.5fr_1fr_1fr] md:p-10">
        <div>
          <Marca />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-tinta-2">
            Agenda, pagamentos, loja e financeiro para lava rápido, feitos para usar no celular.
          </p>
        </div>
        <nav aria-label="Produto">
          <p className="text-sm font-semibold text-tinta">Produto</p>
          <ul className="mt-3 space-y-2 text-sm text-tinta-2">
            <li><a href="#recursos" className="hover:text-tinta">Recursos</a></li>
            <li><a href="#como-funciona" className="hover:text-tinta">Como funciona</a></li>
            <li><a href="#planos" className="hover:text-tinta">Planos</a></li>
            <li><a href="#duvidas" className="hover:text-tinta">Dúvidas</a></li>
          </ul>
        </nav>
        <nav aria-label="Conta">
          <p className="text-sm font-semibold text-tinta">Conta</p>
          <ul className="mt-3 space-y-2 text-sm text-tinta-2">
            <li><Link href="/entrar" className="hover:text-tinta">Entrar</Link></li>
            <li><Link href="/cadastro" className="hover:text-tinta">Cadastrar meu lava rápido</Link></li>
          </ul>
        </nav>
      </div>
      <div className="regua mx-auto mt-6 max-w-6xl" aria-hidden />
      <p className="mx-auto mt-3 max-w-6xl text-xs text-tinta-3">© {new Date().getFullYear()} Pista</p>
    </footer>
  );
}
