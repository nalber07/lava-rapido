import { Marca } from "@/components/marca";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Campo, Cartao, Entrada } from "@/components/ui";
import { criarEmpresa } from "./actions";

export function CriarEmpresa({ nome, slug, telefone }: { nome: string; slug: string; telefone: string }) {
  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Marca />
      <h1 className="mt-10 text-3xl font-light tracking-[-0.03em]">Cadastre seu lava rápido</h1>
      <p className="mt-1 text-tinta-3">Último passo para abrir seu painel.</p>
      <Cartao className="mt-6 p-5">
        <Formulario acao={criarEmpresa} className="space-y-4">
          <Campo rotulo="Nome do lava rápido">
            <Entrada name="empresa" defaultValue={nome} required />
          </Campo>
          <Campo rotulo="Endereço da página" dica="Ex.: brilho-car">
            <Entrada name="slug" defaultValue={slug} pattern="[a-z0-9\-]{3,40}" />
          </Campo>
          <Campo rotulo="WhatsApp do lava rápido">
            <Entrada name="telefone" type="tel" inputMode="tel" defaultValue={telefone} />
          </Campo>
          <BotaoEnviar className="w-full" pendente="Criando…">
            Abrir meu painel
          </BotaoEnviar>
        </Formulario>
      </Cartao>
      <form action="/sair" method="post" className="mt-6 text-center">
        <button className="text-sm text-tinta-3">Sair</button>
      </form>
    </main>
  );
}
