import Link from "next/link";
import { exigirPainel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { AreaTexto, BotaoLink, Cabecalho, Campo, Cartao, Entrada, Selecao, Vazio } from "@/components/ui";
import { criarAgendamentoManual } from "../../actions";
import { hojeISO, moeda, placaFormatada } from "@/lib/format";

export default async function NovoAgendamento({ searchParams }: PageProps<"/painel/agenda/novo">) {
  const { empresa } = await exigirPainel();
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: veiculos }, { data: servicos }] = await Promise.all([
    supabase
      .from("veiculos")
      .select("id, placa, modelo, clientes(nome)")
      .eq("empresa_id", empresa.id)
      .order("criado_em", { ascending: false })
      .limit(500),
    supabase.from("servicos").select("id, nome, preco_centavos, duracao_minutos").eq("empresa_id", empresa.id).eq("ativo", true).order("ordem"),
  ]);

  const opcoes = ((veiculos ?? []) as unknown as { id: string; placa: string; modelo: string | null; clientes: { nome: string } | null }[])
    .map((v) => ({ id: v.id, rotulo: `${v.clientes?.nome ?? "Cliente"} · ${[v.modelo, placaFormatada(v.placa)].filter(Boolean).join(" ")}` }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));
  const veiculoPadrao = typeof sp.veiculo === "string" ? sp.veiculo : "";

  return (
    <>
      <Cabecalho titulo="Novo agendamento" descricao="Para clientes que ligaram ou chegaram sem agendar." />
      {opcoes.length === 0 ? (
        <Vazio
          titulo="Cadastre um cliente primeiro"
          texto="O agendamento precisa de um cliente com veículo."
          acao={<BotaoLink href="/painel/clientes/novo">Cadastrar cliente</BotaoLink>}
        />
      ) : (
        <Cartao className="max-w-xl p-5">
          <Formulario acao={criarAgendamentoManual} className="space-y-4">
            <Campo rotulo="Cliente e veículo">
              <Selecao name="veiculo_id" required defaultValue={veiculoPadrao}>
                <option value="" disabled>
                  Selecione…
                </option>
                {opcoes.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.rotulo}
                  </option>
                ))}
              </Selecao>
            </Campo>
            <Campo rotulo="Serviço">
              <Selecao name="servico_id" required defaultValue="">
                <option value="" disabled>
                  Selecione…
                </option>
                {(servicos ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} · {moeda(s.preco_centavos)} · {s.duracao_minutos} min
                  </option>
                ))}
              </Selecao>
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Dia">
                <Entrada type="date" name="data" required defaultValue={typeof sp.dia === "string" ? sp.dia : hojeISO()} />
              </Campo>
              <Campo rotulo="Horário">
                <Entrada type="time" name="hora" required step={300} />
              </Campo>
            </div>
            <Campo rotulo="Valor (opcional)" dica="Deixe vazio para usar o preço do serviço">
              <Entrada name="valor" inputMode="decimal" placeholder="0,00" />
            </Campo>
            <Campo rotulo="Observações">
              <AreaTexto name="observacoes" rows={2} />
            </Campo>
            <div className="flex gap-2 pt-1">
              <BotaoEnviar className="flex-1">Agendar</BotaoEnviar>
              <Link href="/painel/agenda" className="grid place-items-center px-4 text-sm font-medium text-tinta-2">
                Cancelar
              </Link>
            </div>
          </Formulario>
        </Cartao>
      )}
    </>
  );
}
