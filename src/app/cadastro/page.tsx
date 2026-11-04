import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Marca } from "@/components/marca";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Campo, Cartao, Entrada } from "@/components/ui";
import { cadastrarDono } from "../entrar/actions";
import { AlternarTema } from "@/components/tema";

export const metadata: Metadata = { title: "Cadastre seu lava rápido" };

export default function Cadastro() {
  return (
    <main className="relative isolate mx-auto grid min-h-dvh max-w-5xl content-start gap-10 px-5 py-6 md:grid-cols-2 md:items-start md:py-10">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,rgb(252_163_17/0.16),transparent_70%)]" aria-hidden />
      <div className="flex items-center justify-between md:col-span-2">
        <Marca />
        <AlternarTema />
      </div>
      <div className="animate-entra md:pt-8">
        <h1 className="text-4xl font-light leading-[1.05] tracking-[-0.035em] md:text-5xl">
          Coloque seu lava rápido no celular dos clientes
        </h1>
        <ul className="mt-8 space-y-3.5 text-tinta-2">
          {["14 dias grátis, sem cartão", "Página de agendamento pronta na hora", "Serviços de exemplo já cadastrados"].map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-acao text-sobre-acao"><Check className="size-3.5" strokeWidth={3} aria-hidden /></span> {t}
            </li>
          ))}
        </ul>
      </div>

      <Cartao className="animate-entra p-5 md:p-7" style={{ animationDelay: "150ms" }}>
        <Formulario acao={cadastrarDono} className="space-y-4">
          <Campo rotulo="Nome do lava rápido">
            <Entrada name="empresa" required placeholder="Ex.: Brilho Car" />
          </Campo>
          <Campo rotulo="Endereço da sua página" dica="Só letras minúsculas, números e hífen. Ex.: brilho-car">
            <div className="flex items-center rounded-xl border border-borda-forte bg-fundo pl-3.5 focus-within:border-agua-500">
              <span className="shrink-0 text-sm text-tinta-3">/l/</span>
              <Entrada name="slug" className="border-0 bg-transparent pl-1 focus:ring-0" placeholder="brilho-car" pattern="[a-z0-9\-]{3,40}" />
            </div>
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Seu nome">
              <Entrada name="nome" autoComplete="name" required />
            </Campo>
            <Campo rotulo="WhatsApp">
              <Entrada name="telefone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 98888-7777" />
            </Campo>
          </div>
          <Campo rotulo="E-mail">
            <Entrada name="email" type="email" inputMode="email" autoComplete="email" required />
          </Campo>
          <Campo rotulo="Senha" dica="Mínimo de 6 caracteres">
            <Entrada name="senha" type="password" autoComplete="new-password" minLength={6} required />
          </Campo>
          <BotaoEnviar className="w-full" tamanho="lg" pendente="Criando…">
            Criar meu lava rápido
          </BotaoEnviar>
          <p className="text-center text-sm text-tinta-3">
            Já tem conta?{" "}
            <Link href="/entrar" className="font-medium text-agua-700">
              Entrar
            </Link>
          </p>
        </Formulario>
      </Cartao>
    </main>
  );
}
