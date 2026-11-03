export type StatusAgendamento = "agendado" | "em_lavagem" | "pronto" | "entregue" | "cancelado";
export type StatusPagamento = "pendente" | "pago" | "reembolsado";
export type FormaPagamento = "pix" | "cartao" | "dinheiro" | "no_local" | "plano" | "fidelidade";
export type StatusPedido = "aberto" | "pronto" | "retirado" | "cancelado";
export type StatusAssinatura = "teste" | "ativa" | "atrasada" | "cancelada";

export type Empresa = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  telefone: string | null;
  whatsapp: string | null;
  endereco: string | null;
  cidade: string | null;
  logo_url: string | null;
  abre: string;
  fecha: string;
  dias_funcionamento: number[];
  vagas_simultaneas: number;
  intervalo_minutos: number;
  fidelidade_ativa: boolean;
  fidelidade_meta: number;
  aceita_pagamento_online: boolean;
  plano_id: string;
  status_assinatura: StatusAssinatura;
  teste_ate: string;
  assinatura_ate: string | null;
};

export type Servico = {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  preco_centavos: number;
  duracao_minutos: number;
  ativo: boolean;
  ordem: number;
};

export type Produto = {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  preco_centavos: number;
  estoque: number;
  foto_url: string | null;
  ativo: boolean;
};

export type PlanoCliente = {
  id: string;
  empresa_id: string;
  servico_id: string;
  nome: string;
  descricao: string | null;
  preco_centavos: number;
  lavagens_mes: number;
  ativo: boolean;
};

export type Veiculo = {
  id: string;
  cliente_id: string;
  placa: string;
  modelo: string | null;
  cor: string | null;
  tipo: string;
};

export const STATUS_AGENDAMENTO: Record<StatusAgendamento, { rotulo: string; tom: Tom }> = {
  agendado: { rotulo: "Agendado", tom: "azul" },
  em_lavagem: { rotulo: "Em lavagem", tom: "ambar" },
  pronto: { rotulo: "Pronto", tom: "verde" },
  entregue: { rotulo: "Entregue", tom: "neutro" },
  cancelado: { rotulo: "Cancelado", tom: "vermelho" },
};

export const FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: "Pix",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  no_local: "No local",
  plano: "Plano mensal",
  fidelidade: "Fidelidade",
};

export const STATUS_PEDIDO: Record<StatusPedido, { rotulo: string; tom: Tom }> = {
  aberto: { rotulo: "Separar", tom: "azul" },
  pronto: { rotulo: "Pronto p/ retirar", tom: "verde" },
  retirado: { rotulo: "Retirado", tom: "neutro" },
  cancelado: { rotulo: "Cancelado", tom: "vermelho" },
};

export type Tom = "azul" | "verde" | "ambar" | "vermelho" | "neutro";
