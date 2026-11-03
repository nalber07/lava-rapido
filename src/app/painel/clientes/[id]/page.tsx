import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, MessageCircle, Trash2 } from "lucide-react";
import { exigirPainel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AreaTexto, BotaoLink, Campo, Cartao, Entrada, Secao, Selecao, Selo, Vazio, classeBotao } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { BotaoEnviar } from "@/components/botao-enviar";
import { excluirCliente, excluirVeiculo, salvarCliente, salvarVeiculo } from "../../actions";
import { dataHora, linkWhatsApp, moeda, placaFormatada } from "@/lib/format";
import { STATUS_AGENDAMENTO, type StatusAgendamento } from "@/lib/types";

export default async function Cliente({ params }: PageProps<"/painel/clientes/[id]">) {
  const { id } = await params;
  const { empresa, papel } = await exigirPainel();
  const supabase = await createClient();
  const [{ data: c }, { data: historico }] = await Promise.all([
    supabase.from("clientes").select("*, veiculos(*)").eq("id", id).eq("empresa_id", empresa.id).maybeSingle(),
    supabase
      .from("agendamentos")
      .select("id, inicio, servico_nome, valor_centavos, status")
      .eq("cliente_id", id)
      .order("inicio", { ascending: false })
      .limit(30),
  ]);
  if (!c) notFound();
  const veiculos = (c.veiculos ?? []) as { id: string; placa: string; modelo: string | null; cor: string | null; tipo: string }[];
  const gasto = (historico ?? []).filter((h) => h.status === "entregue").reduce((t, h) => t + h.valor_centavos, 0);

  return (
    <>
      <Link href="/painel/clientes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-tinta-2">
        <ArrowLeft className="size-4" aria-hidden /> Clientes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{c.nome}</h1>
          <p className="text-sm text-tinta-3">
            {historico?.length ?? 0} visita(s) · {moeda(gasto)} gastos
            {empresa.fidelidade_ativa && ` · ${c.selos}/${empresa.fidelidade_meta} selos`}
          </p>
        </div>
        <div className="flex gap-2">
          {c.telefone && (
            <a href={linkWhatsApp(c.telefone, `Olá, ${c.nome.split(" ")[0]}!`)} target="_blank" className={classeBotao("secundario", "sm")}>
              <MessageCircle className="size-4 text-espuma" aria-hidden /> WhatsApp
            </a>
          )}
          {veiculos[0] && (
            <BotaoLink href={`/painel/agenda/novo?veiculo=${veiculos[0].id}`} tamanho="sm">
              <CalendarPlus className="size-4" aria-hidden /> Agendar
            </BotaoLink>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Secao titulo="Veículos">
            <Cartao className="divide-y divide-borda">
              {veiculos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="rounded-md border border-tinta/20 bg-fundo px-2 py-1 font-mono text-sm font-semibold">{placaFormatada(v.placa)}</span>
                  <span className="flex-1 text-sm text-tinta-2">{[v.modelo, v.cor].filter(Boolean).join(" · ") || v.tipo}</span>
                  <form action={excluirVeiculo.bind(null, v.id, c.id)}>
                    <button className="grid size-9 place-items-center rounded-lg text-tinta-3 hover:bg-perigo-50 hover:text-perigo" aria-label="Remover veículo">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              ))}
              <Formulario acao={salvarVeiculo} limparAoSalvar className="space-y-3 p-4">
                <input type="hidden" name="cliente_id" value={c.id} />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Entrada name="placa" placeholder="Placa" className="uppercase" required aria-label="Placa" />
                  <Entrada name="modelo" placeholder="Modelo" aria-label="Modelo" />
                  <Entrada name="cor" placeholder="Cor" aria-label="Cor" />
                  <Selecao name="tipo" defaultValue="carro" aria-label="Tipo">
                    <option value="carro">Carro</option>
                    <option value="suv">SUV</option>
                    <option value="caminhonete">Caminhonete</option>
                    <option value="moto">Moto</option>
                    <option value="van">Van</option>
                  </Selecao>
                </div>
                <BotaoEnviar variante="secundario" tamanho="sm">
                  Adicionar veículo
                </BotaoEnviar>
              </Formulario>
            </Cartao>
          </Secao>

          <Secao titulo="Histórico">
            {(historico ?? []).length === 0 ? (
              <Vazio titulo="Nenhuma lavagem ainda" />
            ) : (
              <Cartao className="divide-y divide-borda overflow-hidden">
                {(historico ?? []).map((h) => {
                  const s = STATUS_AGENDAMENTO[h.status as StatusAgendamento];
                  return (
                    <Link key={h.id} href={`/painel/agenda/${h.id}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-fundo">
                      <span className="w-28 shrink-0 tabular text-tinta-3">{dataHora(h.inicio)}</span>
                      <span className="flex-1 truncate">{h.servico_nome}</span>
                      <span className="tabular">{moeda(h.valor_centavos)}</span>
                      <Selo tom={s.tom}>{s.rotulo}</Selo>
                    </Link>
                  );
                })}
              </Cartao>
            )}
          </Secao>
        </div>

        <Secao titulo="Dados">
          <Cartao className="p-4">
            <Formulario acao={salvarCliente} className="space-y-3">
              <input type="hidden" name="id" value={c.id} />
              <Campo rotulo="Nome">
                <Entrada name="nome" defaultValue={c.nome} required />
              </Campo>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo rotulo="WhatsApp">
                  <Entrada name="telefone" type="tel" defaultValue={c.telefone ?? ""} />
                </Campo>
                <Campo rotulo="E-mail">
                  <Entrada name="email" type="email" defaultValue={c.email ?? ""} />
                </Campo>
              </div>
              <Campo rotulo="Observações">
                <AreaTexto name="observacoes" defaultValue={c.observacoes ?? ""} rows={3} />
              </Campo>
              <BotaoEnviar variante="secundario">Salvar</BotaoEnviar>
            </Formulario>
          </Cartao>
          {papel === "dono" && (
            <form action={excluirCliente.bind(null, c.id)} className="mt-3">
              <button className="text-sm text-perigo hover:underline">Excluir cliente e histórico</button>
            </form>
          )}
        </Secao>
      </div>
    </>
  );
}
