import { BotaoLink, Campo, Cartao, Entrada } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { completarCadastro } from "./actions";

/** Pede login ou o cadastro de cliente antes de continuar. */
export function PedirLogin({ slug, destino, texto }: { slug: string; destino: string; texto: string }) {
  const next = encodeURIComponent(destino);
  return (
    <Cartao className="p-6 text-center">
      <p className="font-display text-lg">Entre para continuar</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-tinta-3">{texto}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <BotaoLink href={`/entrar?modo=criar&next=${next}`}>Criar conta</BotaoLink>
        <BotaoLink href={`/entrar?next=${next}`} variante="secundario">
          Já tenho conta
        </BotaoLink>
      </div>
      <p className="sr-only">{slug}</p>
    </Cartao>
  );
}

export function CompletarCadastro({
  empresaId,
  slug,
  nome,
  telefone,
}: {
  empresaId: string;
  slug: string;
  nome?: string;
  telefone?: string;
}) {
  return (
    <Cartao className="p-5">
      <p className="font-display text-lg">Confirme seus dados</p>
      <p className="mt-1 text-sm text-tinta-3">Assim o lava rápido sabe quem está chegando.</p>
      <Formulario acao={completarCadastro.bind(null, empresaId, slug)} className="mt-4 space-y-3">
        <Campo rotulo="Nome">
          <Entrada name="nome" defaultValue={nome} required autoComplete="name" />
        </Campo>
        <Campo rotulo="WhatsApp" dica="Para avisarmos quando o carro estiver pronto">
          <Entrada name="telefone" type="tel" inputMode="tel" defaultValue={telefone} autoComplete="tel" required />
        </Campo>
        <BotaoEnviar className="w-full">Continuar</BotaoEnviar>
      </Formulario>
    </Cartao>
  );
}
