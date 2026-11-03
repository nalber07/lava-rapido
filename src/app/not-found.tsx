import { BotaoLink } from "@/components/ui";

export default function NaoEncontrado() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-display text-5xl font-semibold text-agua-600">404</p>
        <h1 className="mt-2 text-xl font-semibold">Página não encontrada</h1>
        <p className="mt-1 text-tinta-3">O endereço pode estar errado ou a página foi removida.</p>
        <BotaoLink href="/" className="mt-6">
          Voltar ao início
        </BotaoLink>
      </div>
    </main>
  );
}
