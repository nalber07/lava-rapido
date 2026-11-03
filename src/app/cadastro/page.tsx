import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Marca } from "@/components/marca";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Campo, Cartao, Entrada } from "@/components/ui";
import { cadastrarDono } from "../entrar/actions";

export const metadata: Metadata = { title: "Cadastre seu lava rápido" };

export default function Cadastro() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl gap-10 px-5 py-8 md:grid-cols-2 md:py-14">
      <div>
        <Marca />
        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Coloque seu lava rápido no celular dos clientes
        </h1>
        <ul className="mt-6 space-y-3 text-tinta-2">
          {["14 dias grátis, sem cartão", "Página de agendamento pronta na hora", "Serviços de exemplo já cadastrados"].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check className="mt-0.5 size-5 shrink-0 text-espuma" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </div>

      <Cartao className="p-5 md:p-6">
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
