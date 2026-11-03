import { Plus } from "lucide-react";
import { exigirDono } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AreaTexto, Cabecalho, Campo, Cartao, Entrada, Secao, Selo, cx } from "@/components/ui";
import { Formulario } from "@/components/formulario";
import { InputFotos } from "@/components/input-fotos";
import { BotaoEnviar } from "@/components/botao-enviar";
import { alternarAtivo, salvarProduto, salvarServico } from "../actions";
import { centavosParaInput, moeda } from "@/lib/format";
import type { Produto, Servico } from "@/lib/types";

export default async function Catalogo() {
  const { empresa } = await exigirDono();
  const supabase = await createClient();
  const [{ data: servicos }, { data: produtos }] = await Promise.all([
    supabase.from("servicos").select("*").eq("empresa_id", empresa.id).order("ativo", { ascending: false }).order("ordem"),
    supabase.from("produtos").select("*").eq("empresa_id", empresa.id).order("ativo", { ascending: false }).order("nome"),
  ]);

  return (
    <>
      <Cabecalho titulo="Serviços e produtos" descricao="O que aparece na sua página para os clientes." />

      <Secao titulo="Serviços">
        <Cartao className="divide-y divide-borda overflow-hidden">
          {((servicos ?? []) as Servico[]).map((s) => (
            <details key={s.id} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 hover:bg-fundo">
                <div className={cx("min-w-0 flex-1", !s.ativo && "opacity-50")}>
                  <p className="font-medium">{s.nome}</p>
                  <p className="text-sm text-tinta-3">{s.duracao_minutos} min{s.descricao && ` · ${s.descricao}`}</p>
                </div>
                {!s.ativo && <Selo>Oculto</Selo>}
                <span className="font-semibold tabular">{moeda(s.preco_centavos)}</span>
              </summary>
              <div className="border-t border-borda bg-fundo/60 p-4">
                <FormServico s={s} />
                <form action={alternarAtivo.bind(null, "servicos", s.id, !s.ativo)} className="mt-3">
                  <button className="text-sm font-medium text-tinta-2 hover:text-tinta">
                    {s.ativo ? "Ocultar da página" : "Mostrar na página"}
                  </button>
                </form>
              </div>
            </details>
          ))}
          <details>
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 font-medium text-agua-700 hover:bg-fundo">
              <Plus className="size-4" aria-hidden /> Novo serviço
            </summary>
            <div className="border-t border-borda p-4">
              <FormServico />
            </div>
          </details>
        </Cartao>
      </Secao>

      <Secao titulo="Produtos da loja">
        <Cartao className="divide-y divide-borda overflow-hidden">
          {((produtos ?? []) as Produto[]).map((p) => (
            <details key={p.id}>
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-fundo">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-fundo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.foto_url && <img src={p.foto_url} alt="" className="size-full object-cover" />}
                </div>
                <div className={cx("min-w-0 flex-1", !p.ativo && "opacity-50")}>
                  <p className="truncate font-medium">{p.nome}</p>
                  <p className={cx("text-sm", p.estoque <= 3 ? "text-perigo" : "text-tinta-3")}>
                    {p.estoque} em estoque
                  </p>
                </div>
                {!p.ativo && <Selo>Oculto</Selo>}
                <span className="font-semibold tabular">{moeda(p.preco_centavos)}</span>
              </summary>
              <div className="border-t border-borda bg-fundo/60 p-4">
                <FormProduto p={p} />
                <form action={alternarAtivo.bind(null, "produtos", p.id, !p.ativo)} className="mt-3">
                  <button className="text-sm font-medium text-tinta-2 hover:text-tinta">
                    {p.ativo ? "Ocultar da loja" : "Mostrar na loja"}
                  </button>
                </form>
              </div>
            </details>
          ))}
          <details>
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 font-medium text-agua-700 hover:bg-fundo">
              <Plus className="size-4" aria-hidden /> Novo produto
            </summary>
            <div className="border-t border-borda p-4">
              <FormProduto />
            </div>
          </details>
        </Cartao>
      </Secao>
    </>
  );
}

function FormServico({ s }: { s?: Servico }) {
  return (
    <Formulario acao={salvarServico} limparAoSalvar={!s} className="grid gap-3 sm:grid-cols-2">
      {s && <input type="hidden" name="id" value={s.id} />}
      <Campo rotulo="Nome" className="sm:col-span-2">
        <Entrada name="nome" defaultValue={s?.nome} required />
      </Campo>
      <Campo rotulo="Preço (R$)">
        <Entrada name="preco" inputMode="decimal" defaultValue={s ? centavosParaInput(s.preco_centavos) : ""} required placeholder="0,00" />
      </Campo>
      <Campo rotulo="Duração (min)">
        <Entrada name="duracao" type="number" min={10} max={600} step={5} defaultValue={s?.duracao_minutos ?? 30} required />
      </Campo>
      <Campo rotulo="Descrição" className="sm:col-span-2">
        <AreaTexto name="descricao" defaultValue={s?.descricao ?? ""} rows={2} />
      </Campo>
      <div className="sm:col-span-2">
        <BotaoEnviar tamanho="sm">{s ? "Salvar" : "Criar serviço"}</BotaoEnviar>
      </div>
    </Formulario>
  );
}

function FormProduto({ p }: { p?: Produto }) {
  return (
    <Formulario acao={salvarProduto} limparAoSalvar={!p} className="grid gap-3 sm:grid-cols-2">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Campo rotulo="Nome" className="sm:col-span-2">
        <Entrada name="nome" defaultValue={p?.nome} required />
      </Campo>
      <Campo rotulo="Preço (R$)">
        <Entrada name="preco" inputMode="decimal" defaultValue={p ? centavosParaInput(p.preco_centavos) : ""} required placeholder="0,00" />
      </Campo>
      <Campo rotulo="Estoque">
        <Entrada name="estoque" type="number" min={0} defaultValue={p?.estoque ?? 0} required />
      </Campo>
      <Campo rotulo="Descrição" className="sm:col-span-2">
        <AreaTexto name="descricao" defaultValue={p?.descricao ?? ""} rows={2} />
      </Campo>
      <Campo rotulo="Foto" className="sm:col-span-2">
        <InputFotos name="foto" rotulo="Escolher foto" multiplo={false} />
      </Campo>
      <div className="sm:col-span-2">
        <BotaoEnviar tamanho="sm">{p ? "Salvar" : "Criar produto"}</BotaoEnviar>
      </div>
    </Formulario>
  );
}
