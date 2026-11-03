import { exigirPainel } from "@/lib/auth";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { AreaTexto, Cabecalho, Campo, Cartao, Entrada } from "@/components/ui";
import { salvarCliente } from "../../actions";

export default async function NovoCliente() {
  await exigirPainel();
  return (
    <>
      <Cabecalho titulo="Novo cliente" />
      <Cartao className="max-w-xl p-5">
        <Formulario acao={salvarCliente} className="space-y-4">
          <Campo rotulo="Nome">
            <Entrada name="nome" required autoComplete="off" />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="WhatsApp">
              <Entrada name="telefone" type="tel" inputMode="tel" />
            </Campo>
            <Campo rotulo="E-mail">
              <Entrada name="email" type="email" inputMode="email" />
            </Campo>
          </div>
          <fieldset className="rounded-xl border border-borda p-4">
            <legend className="px-1 text-sm font-medium text-tinta-2">Veículo</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <Campo rotulo="Placa">
                <Entrada name="placa" className="uppercase" placeholder="ABC1D23" />
              </Campo>
              <Campo rotulo="Modelo">
                <Entrada name="modelo" placeholder="Onix" />
              </Campo>
              <Campo rotulo="Cor">
                <Entrada name="cor" placeholder="Prata" />
              </Campo>
            </div>
          </fieldset>
          <Campo rotulo="Observações">
            <AreaTexto name="observacoes" rows={2} />
          </Campo>
          <BotaoEnviar className="w-full sm:w-auto">Salvar cliente</BotaoEnviar>
        </Formulario>
      </Cartao>
    </>
  );
}
