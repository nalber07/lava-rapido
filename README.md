# Lava Rápido

App de gestão por assinatura para lava rápidos, feito para o celular (PWA instalável).

- **Dono:** agenda do dia, clientes e veículos, serviços e produtos, pedidos da loja, financeiro, cartão fidelidade, planos mensais, equipe e assinatura.
- **Cliente final** (`/l/<nome-do-lava>`): agenda a lavagem escolhendo serviço, veículo, dia e horário livre; paga por Pix/cartão (Mercado Pago) ou no local; compra produtos; acompanha o status do carro e vê fotos de antes e depois.
- **Admin da plataforma** (`/admin`): lista de lava rápidos, assinantes e receita mensal.

## Stack

Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Supabase (Auth, Postgres com RLS, Storage) · Mercado Pago · Vercel.

## Como rodar

1. Crie um projeto no [Supabase](https://supabase.com/dashboard) e rode o SQL de `supabase/migrations/0001_schema.sql` (SQL Editor) ou `npx supabase db push`.
2. Copie `.env.example` para `.env.local` e preencha as chaves (Project Settings > API).
3. `npm install` e `npm run dev`.

Para desenvolver com o Supabase local: `npx supabase start` (precisa de Docker).

### Variáveis de ambiente

| Nome | Para quê |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexão com o Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook de pagamento e leitura do token do Mercado Pago de cada lava rápido (só no servidor) |
| `NEXT_PUBLIC_SITE_URL` | URL pública, usada nos links de confirmação e retorno de pagamento |
| `MP_ACCESS_TOKEN` | Mercado Pago da plataforma, cobra a assinatura mensal dos donos |

### Pagamentos

- Cada dono cola o próprio Access Token do Mercado Pago em **Configurações**; os pagamentos dos clientes caem direto na conta dele.
- Configure o webhook do Mercado Pago da plataforma para `https://SEU-SITE/api/mercadopago/webhook` (eventos de assinaturas). Pagamentos dos clientes já enviam a URL de notificação automaticamente.

### Tornar-se admin

No SQL Editor: `update perfis set is_admin = true where id = (select id from auth.users where email = 'seu@email.com');`

## Segurança

Todas as tabelas têm RLS: cada lava rápido só vê os próprios dados, funcionários não veem o financeiro, clientes só veem os próprios agendamentos e pedidos. Agendamentos, pedidos e planos são criados por funções no banco que validam horário livre, estoque, selos e plano.
