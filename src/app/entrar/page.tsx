import Link from "next/link";
import type { Metadata } from "next";
import { Marca } from "@/components/marca";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Campo, Cartao, Entrada, cx } from "@/components/ui";
import { criarConta, entrar } from "./actions";
import { destinoSeguro } from "@/lib/site";
import { AlternarTema } from "@/components/tema";

export const metadata: Metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const sp = await searchParams;
  const next = destinoSeguro(sp.next as string | undefined);
  const modo = sp.modo === "criar" ? "criar" : "entrar";
  const qs = (m: string) => `/entrar?modo=${m}&next=${encodeURIComponent(next)}`;
  const ehCliente = next.startsWith("/l/");

  return (
    <main className="relative isolate mx-auto flex min-h-dvh max-w-md flex-col px-5 py-6">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,rgb(252_163_17/0.16),transparent_70%)]" aria-hidden />
      <div className="flex items-center justify-between">
        <Marca />
        <AlternarTema />
      </div>
      <div className="animate-entra mt-12">
        <h1 className="text-4xl font-light tracking-[-0.03em]">
          {modo === "entrar" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h1>
        <p className="mt-1 text-tinta-3">
          {ehCliente ? "Para agendar e acompanhar seus carros." : "Acesse seu painel."}
        </p>
      </div>

      <div className="animate-entra mt-7 grid grid-cols-2 rounded-full border border-borda bg-superficie p-1 text-sm font-semibold" style={{ animationDelay: "120ms" }}>
        {(["entrar", "criar"] as const).map((m) => (
          <Link
            key={m}
            href={qs(m)}
            replace
            className={cx("rounded-full py-2.5 text-center transition-colors duration-300", modo === m ? "bg-acao text-sobre-acao" : "text-tinta-2 hover:text-tinta")}
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </Link>
        ))}
      </div>

      <Cartao className="animate-entra mt-4 p-5 md:p-6" style={{ animationDelay: "220ms" }}>
        {modo === "entrar" ? (
          <Formulario acao={entrar} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <Campo rotulo="E-mail">
              <Entrada name="email" type="email" autoComplete="email" inputMode="email" required />
            </Campo>
            <Campo rotulo="Senha">
              <Entrada name="senha" type="password" autoComplete="current-password" required />
            </Campo>
            <BotaoEnviar className="w-full" pendente="Entrando…">
              Entrar
            </BotaoEnviar>
          </Formulario>
        ) : (
          <Formulario acao={criarConta} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <Campo rotulo="Nome">
              <Entrada name="nome" autoComplete="name" required />
            </Campo>
            <Campo rotulo="WhatsApp">
              <Entrada name="telefone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 98888-7777" />
            </Campo>
            <Campo rotulo="E-mail">
              <Entrada name="email" type="email" autoComplete="email" inputMode="email" required />
            </Campo>
            <Campo rotulo="Senha" dica="Mínimo de 6 caracteres">
              <Entrada name="senha" type="password" autoComplete="new-password" minLength={6} required />
            </Campo>
            <BotaoEnviar className="w-full" pendente="Criando…">
              Criar conta
            </BotaoEnviar>
          </Formulario>
        )}
      </Cartao>

      {!ehCliente && (
        <p className="mt-6 text-center text-sm text-tinta-3">
          Tem um lava rápido?{" "}
          <Link href="/cadastro" className="font-medium text-agua-700">
            Cadastre seu negócio
          </Link>
        </p>
      )}
    </main>
  );
}
