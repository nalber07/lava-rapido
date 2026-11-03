export const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    preco_centavos: 4900,
    usuarios: "1 usuário",
    recursos: ["Agenda e clientes", "Catálogo de serviços", "Página de agendamento", "Aviso de carro pronto no WhatsApp"],
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco_centavos: 9900,
    usuarios: "Até 5 usuários",
    destaque: true,
    recursos: ["Tudo do Básico", "Pagamento online (Pix e cartão)", "Loja de produtos", "Controle financeiro", "Cartão fidelidade"],
  },
  {
    id: "premium",
    nome: "Premium",
    preco_centavos: 17900,
    usuarios: "Usuários ilimitados",
    recursos: ["Tudo do Profissional", "Planos mensais de lavagem", "Fotos de antes e depois", "Suporte prioritário"],
  },
] as const;

export type PlanoId = (typeof PLANOS)[number]["id"];
export const planoPorId = (id: string) => PLANOS.find((p) => p.id === id) ?? PLANOS[1];
