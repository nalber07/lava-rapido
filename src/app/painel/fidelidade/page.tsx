import { exigirDono } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AreaTexto, Cabecalho, Campo, Cartao, Entrada, Secao, Selecao, Selo, Vazio, cx } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { alternarAtivo, ativarAssinaturaCliente, cancelarAssinaturaCliente, salvarFidelidade, salvarPlanoCliente } from "../actions";
import { moeda } from "@/lib/format";

export default async function Fidelidade() {
  const { empresa } = await exigirDono();
  const supabase = await createClient();
  const [{ data: planos }, { data: servicos }, { data: assinaturas }, { data: topo }] = await Promise.all([
    supabase.from("planos_cliente").select("*, servicos(nome)").eq("empresa_id", empresa.id).order("criado_em"),
    supabase.from("servicos").select("id, nome").eq("empresa_id", empresa.id).eq("ativo", true).order("ordem"),
    supabase
      .from("assinaturas_cliente")
      .select("id, status, valido_ate, lavagens_usadas, clientes(nome), planos_cliente(nome, lavagens_mes, preco_centavos)")
      .eq("empresa_id", empresa.id)
      .neq("status", "cancelada")
      .order("status", { ascending: true })
      .order("criado_em", { ascending: false }),
    supabase.from("clientes").select("id, nome, selos").eq("empresa_id", empresa.id).gt("selos", 0).order("selos", { ascending: false }).limit(8),
  ]);

  const lista = (assinaturas ?? []) as unknown as {
    id: string;
    status: "pendente" | "ativa";
    valido_ate: string | null;
    lavagens_usadas: number;
    clientes: { nome: string } | null;
    planos_cliente: { nome: string; lavagens_mes: number; preco_centavos: number } | null;
  }[];

  return (
    <>
      <Cabecalho titulo="Fidelidade e planos" descricao="Faça o cliente voltar e garanta receita todo mês." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Secao titulo="Cartão fidelidade">
          <Cartao className="p-4">
            <Formulario acao={salvarFidelidade} className="space-y-4">
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block font-medium">Ativar cartão fidelidade</span>
                  <span className="text-sm text-tinta-3">Cada lavagem paga entregue vale 1 selo.</span>
                </span>
                <input type="checkbox" name="ativa" defaultChecked={empresa.fidelidade_ativa} className="size-5 accent-agua-600" />
              </label>
              <Campo rotulo="Selos para ganhar uma lavagem grátis">
                <Entrada type="number" name="meta" min={2} max={50} defaultValue={empresa.fidelidade_meta} />
              </Campo>
              <BotaoEnviar variante="secundario" tamanho="sm">
                Salvar
              </BotaoEnviar>
            </Formulario>
            {(topo ?? []).length > 0 && (
              <div className="mt-5 border-t border-borda pt-4">
                <p className="mb-2 text-sm font-medium text-tinta-2">Mais perto da lavagem grátis</p>
                <ul className="space-y-2">
                  {(topo ?? []).map((c) => (
                    <li key={c.id} className="flex items-center gap-3 text-sm">
                      <span className="flex-1 truncate">{c.nome}</span>
                      <span className="flex gap-0.5" aria-label={`${c.selos} de ${empresa.fidelidade_meta} selos`}>
                        {Array.from({ length: empresa.fidelidade_meta }, (_, i) => (
                          <span key={i} className={cx("size-2 rounded-full", i < c.selos ? "bg-agua-600" : "bg-borda")} />
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Cartao>
        </Secao>

        <Secao titulo="Planos mensais de lavagem">
          <Cartao className="divide-y divide-borda overflow-hidden">
            {(planos ?? []).map((p) => (
              <div key={p.id} className={cx("flex items-center gap-3 px-4 py-3", !p.ativo && "opacity-50")}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.nome}</p>
                  <p className="text-sm text-tinta-3">
                    {p.lavagens_mes}× {(p.servicos as { nome: string } | null)?.nome} por mês
                  </p>
                </div>
                <span className="font-semibold tabular">{moeda(p.preco_centavos)}</span>
                <form action={alternarAtivo.bind(null, "planos_cliente", p.id, !p.ativo)}>
                  <button className="text-sm text-tinta-3 hover:text-tinta">{p.ativo ? "Pausar" : "Ativar"}</button>
                </form>
              </div>
            ))}
            <details>
              <summary className="cursor-pointer list-none px-4 py-3.5 font-medium text-agua-700 hover:bg-fundo">+ Criar plano</summary>
              <div className="border-t border-borda p-4">
                <Formulario acao={salvarPlanoCliente} limparAoSalvar className="grid gap-3 sm:grid-cols-2">
                  <Campo rotulo="Nome do plano" className="sm:col-span-2">
                    <Entrada name="nome" required placeholder="Ex.: Carro sempre limpo" />
                  </Campo>
                  <Campo rotulo="Serviço incluído">
                    <Selecao name="servico_id" required defaultValue="">
                      <option value="" disabled>
                        Selecione…
                      </option>
                      {(servicos ?? []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </Selecao>
                  </Campo>
                  <Campo rotulo="Lavagens por mês">
                    <Entrada type="number" name="lavagens" min={1} max={60} defaultValue={4} required />
                  </Campo>
                  <Campo rotulo="Preço mensal (R$)">
                    <Entrada name="preco" inputMode="decimal" required placeholder="0,00" />
                  </Campo>
                  <Campo rotulo="Descrição" className="sm:col-span-2">
                    <AreaTexto name="descricao" rows={2} />
                  </Campo>
                  <div className="sm:col-span-2">
                    <BotaoEnviar tamanho="sm">Criar plano</BotaoEnviar>
                  </div>
                </Formulario>
              </div>
            </details>
          </Cartao>
        </Secao>
      </div>

      <Secao titulo="Assinantes">
        {lista.length === 0 ? (
          <Vazio titulo="Nenhum assinante ainda" texto="Quando um cliente assinar um plano pela sua página, ele aparece aqui." />
        ) : (
          <Cartao className="divide-y divide-borda overflow-hidden">
            {lista.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.clientes?.nome}</p>
                  <p className="text-sm text-tinta-3">
                    {a.planos_cliente?.nome} · {moeda(a.planos_cliente?.preco_centavos)}/mês
                    {a.status === "ativa" && ` · ${a.lavagens_usadas}/${a.planos_cliente?.lavagens_mes} usadas`}
                    {a.valido_ate && ` · até ${new Date(`${a.valido_ate}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" })}`}
                  </p>
                </div>
                <Selo tom={a.status === "ativa" ? "verde" : "ambar"}>{a.status === "ativa" ? "Ativa" : "Aguardando pagamento"}</Selo>
                <form action={ativarAssinaturaCliente.bind(null, a.id)}>
                  <BotaoEnviar tamanho="sm" variante={a.status === "ativa" ? "secundario" : "primario"}>
                    {a.status === "ativa" ? "Renovar +1 mês" : "Confirmar pagamento"}
                  </BotaoEnviar>
                </form>
                <form action={cancelarAssinaturaCliente.bind(null, a.id)}>
                  <button className="text-sm text-tinta-3 hover:text-perigo">Cancelar</button>
                </form>
              </div>
            ))}
          </Cartao>
        )}
      </Secao>
    </>
  );
}
