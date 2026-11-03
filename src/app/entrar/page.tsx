import Link from "next/link";
import type { Metadata } from "next";
import { Marca } from "@/components/marca";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Campo, Cartao, Entrada, cx } from "@/components/ui";
import { criarConta, entrar } from "./actions";
import { destinoSeguro } from "@/lib/site";

export const metadata: Metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const sp = await searchParams;
  const next = destinoSeguro(sp.next as string | undefined);
  const modo = sp.modo === "criar" ? "criar" : "entrar";
  const qs = (m: string) => `/entrar?modo=${m}&next=${encodeURIComponent(next)}`;
  const ehCliente = next.startsWith("/l/");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
      <Marca />
      <div className="mt-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {modo === "entrar" ? "Bem-vindo de volta" : "Crie sua conta"}
        </h1>
        <p className="mt-1 text-tinta-3">
          {ehCliente ? "Para agendar e acompanhar seus carros." : "Acesse seu painel."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-xl bg-borda/60 p-1 text-sm font-medium">
        {(["entrar", "criar"] as const).map((m) => (
          <Link
            key={m}
            href={qs(m)}
            replace
            className={cx("rounded-lg py-2 text-center", modo === m ? "bg-superficie shadow-cartao" : "text-tinta-2")}
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </Link>
        ))}
      </div>

      <Cartao className="mt-4 p-5">
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
