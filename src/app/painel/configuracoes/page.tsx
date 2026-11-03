import { Trash2 } from "lucide-react";
import { exigirDono } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AreaTexto, Cabecalho, Campo, Cartao, Entrada, Secao, Selecao, Selo } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { InputFotos } from "@/components/input-fotos";
import { BotaoEnviar } from "@/components/botao-enviar";
import { convidarMembro, enviarLogo, removerConvite, removerMembro, salvarEmpresa, salvarTokenMP } from "../actions";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function Configuracoes() {
  const { empresa, usuarioId } = await exigirDono();
  const supabase = await createClient();
  const [{ data: equipe }, { data: convites }] = await Promise.all([
    supabase.rpc("listar_equipe", { p_empresa: empresa.id }),
    supabase.from("convites").select("id, email").eq("empresa_id", empresa.id),
  ]);

  return (
    <>
      <Cabecalho titulo="Configurações" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Secao titulo="Seu lava rápido">
            <Cartao className="p-4">
              <Formulario acao={salvarEmpresa} className="space-y-3">
                <Campo rotulo="Nome">
                  <Entrada name="nome" defaultValue={empresa.nome} required />
                </Campo>
                <Campo rotulo="Endereço da página" dica={`Seus clientes acessam /l/${empresa.slug}`}>
                  <Entrada name="slug" defaultValue={empresa.slug} pattern="[a-z0-9\-]{3,40}" required />
                </Campo>
                <Campo rotulo="Descrição curta">
                  <AreaTexto name="descricao" defaultValue={empresa.descricao ?? ""} rows={2} placeholder="Ex.: Lavagem com produtos biodegradáveis e café enquanto espera." />
                </Campo>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo rotulo="Telefone">
                    <Entrada name="telefone" type="tel" defaultValue={empresa.telefone ?? ""} />
                  </Campo>
                  <Campo rotulo="WhatsApp">
                    <Entrada name="whatsapp" type="tel" defaultValue={empresa.whatsapp ?? ""} />
                  </Campo>
                </div>
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                  <Campo rotulo="Endereço">
                    <Entrada name="endereco" defaultValue={empresa.endereco ?? ""} />
                  </Campo>
                  <Campo rotulo="Cidade">
                    <Entrada name="cidade" defaultValue={empresa.cidade ?? ""} />
                  </Campo>
                </div>

                <fieldset className="border-t border-borda pt-4">
                  <legend className="mb-2 text-sm font-medium text-tinta-2">Funcionamento</legend>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {DIAS.map((d, i) => (
                      <label
                        key={d}
                        className="cursor-pointer rounded-lg border border-borda-forte px-3 py-2 text-sm font-medium has-[:checked]:border-agua-600 has-[:checked]:bg-agua-50 has-[:checked]:text-agua-700"
                      >
                        <input type="checkbox" name="dias" value={i} defaultChecked={empresa.dias_funcionamento.includes(i)} className="sr-only" />
                        {d}
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Campo rotulo="Abre">
                      <Entrada type="time" name="abre" defaultValue={empresa.abre.slice(0, 5)} required />
                    </Campo>
                    <Campo rotulo="Fecha">
                      <Entrada type="time" name="fecha" defaultValue={empresa.fecha.slice(0, 5)} required />
                    </Campo>
                    <Campo rotulo="Vagas" dica="Carros ao mesmo tempo">
                      <Entrada type="number" name="vagas" min={1} max={50} defaultValue={empresa.vagas_simultaneas} required />
                    </Campo>
                    <Campo rotulo="Intervalo">
                      <Selecao name="intervalo" defaultValue={String(empresa.intervalo_minutos)}>
                        {[15, 20, 30, 45, 60].map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </Selecao>
                    </Campo>
                  </div>
                </fieldset>
                <BotaoEnviar>Salvar</BotaoEnviar>
              </Formulario>
            </Cartao>
          </Secao>

          <Secao titulo="Logo">
            <Cartao className="flex items-center gap-4 p-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-fundo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {empresa.logo_url && <img src={empresa.logo_url} alt="Logo atual" className="size-full object-cover" />}
              </div>
              <Formulario acao={enviarLogo} className="flex-1 space-y-2">
                <InputFotos name="logo" rotulo="Escolher imagem" multiplo={false} />
                <BotaoEnviar variante="secundario" tamanho="sm" pendente="Enviando…">
                  Enviar logo
                </BotaoEnviar>
              </Formulario>
            </Cartao>
          </Secao>
        </div>

        <div>
          <Secao titulo="Pagamento online">
            <Cartao className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Mercado Pago</p>
                <Selo tom={empresa.aceita_pagamento_online ? "verde" : "neutro"}>
                  {empresa.aceita_pagamento_online ? "Ativo" : "Desativado"}
                </Selo>
              </div>
              <p className="text-sm text-tinta-2">
                Seus clientes pagam com Pix ou cartão ao agendar, e o dinheiro cai direto na sua conta do Mercado Pago. Copie o{" "}
                <strong>Access Token de produção</strong> em{" "}
                <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" className="font-medium text-agua-700 underline">
                  Suas integrações
                </a>{" "}
                e cole aqui.
              </p>
              <Formulario acao={salvarTokenMP} className="space-y-2">
                <Entrada name="token" type="password" autoComplete="off" placeholder={empresa.aceita_pagamento_online ? "•••••••• (salvo)" : "APP_USR-…"} />
                <p className="text-xs text-tinta-3">O token fica guardado no servidor e nunca aparece na página. Deixe vazio e salve para desativar.</p>
                <BotaoEnviar variante="secundario" tamanho="sm">
                  Salvar token
                </BotaoEnviar>
              </Formulario>
            </Cartao>
          </Secao>

          <Secao titulo="Equipe">
            <Cartao className="divide-y divide-borda">
              {((equipe ?? []) as { usuario_id: string; nome: string | null; email: string; papel: string }[]).map((m) => (
                <div key={m.usuario_id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.nome || m.email}</p>
                    <p className="truncate text-sm text-tinta-3">{m.email}</p>
                  </div>
                  <Selo tom={m.papel === "dono" ? "azul" : "neutro"}>{m.papel === "dono" ? "Dono" : "Funcionário"}</Selo>
                  {m.usuario_id !== usuarioId && (
                    <form action={removerMembro.bind(null, m.usuario_id)}>
                      <button className="grid size-8 place-items-center rounded-lg text-tinta-3 hover:bg-perigo-50 hover:text-perigo" aria-label="Remover da equipe">
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  )}
                </div>
              ))}
              {(convites ?? []).map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <p className="min-w-0 flex-1 truncate text-sm text-tinta-2">{c.email}</p>
                  <Selo tom="ambar">Convite pendente</Selo>
                  <form action={removerConvite.bind(null, c.id)}>
                    <button className="grid size-8 place-items-center rounded-lg text-tinta-3 hover:bg-perigo-50 hover:text-perigo" aria-label="Cancelar convite">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              ))}
              <Formulario acao={convidarMembro} limparAoSalvar className="space-y-2 p-4">
                <p className="text-sm text-tinta-2">Funcionários veem agenda, clientes e pedidos, mas não o financeiro.</p>
                <div className="flex gap-2">
                  <Entrada name="email" type="email" placeholder="email@funcionario.com" required aria-label="E-mail do funcionário" />
                  <BotaoEnviar variante="secundario" pendente="…">
                    Convidar
                  </BotaoEnviar>
                </div>
              </Formulario>
            </Cartao>
          </Secao>
        </div>
      </div>
    </>
  );
}
