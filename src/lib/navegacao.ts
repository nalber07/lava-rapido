import { CalendarDays, CreditCard, Home, Package, Settings, ShoppingBag, Stamp, Users, Wallet, type LucideIcon } from "lucide-react";

export type ItemNav = { href: string; rotulo: string; icone: LucideIcon; exato?: boolean; dono?: boolean };

export const ITENS_PAINEL: ItemNav[] = [
  { href: "/painel", rotulo: "Início", icone: Home, exato: true },
  { href: "/painel/agenda", rotulo: "Agenda", icone: CalendarDays },
  { href: "/painel/clientes", rotulo: "Clientes", icone: Users },
  { href: "/painel/pedidos", rotulo: "Pedidos", icone: ShoppingBag },
  { href: "/painel/catalogo", rotulo: "Serviços e produtos", icone: Package, dono: true },
  { href: "/painel/financeiro", rotulo: "Financeiro", icone: Wallet, dono: true },
  { href: "/painel/fidelidade", rotulo: "Fidelidade e planos", icone: Stamp, dono: true },
  { href: "/painel/configuracoes", rotulo: "Configurações", icone: Settings, dono: true },
  { href: "/painel/assinatura", rotulo: "Minha assinatura", icone: CreditCard, dono: true },
];
