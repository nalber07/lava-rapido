-- Lava Rápido: esquema inicial (multi-empresa com RLS)
-- Fuso horário de referência dos horários: America/Sao_Paulo

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.papel_membro as enum ('dono', 'funcionario');
create type public.status_agendamento as enum ('agendado', 'em_lavagem', 'pronto', 'entregue', 'cancelado');
create type public.status_pagamento as enum ('pendente', 'pago', 'reembolsado');
create type public.forma_pagamento as enum ('pix', 'cartao', 'dinheiro', 'no_local', 'plano', 'fidelidade');
create type public.tipo_lancamento as enum ('entrada', 'saida');
create type public.status_assinatura as enum ('teste', 'ativa', 'atrasada', 'cancelada');
create type public.status_pedido as enum ('aberto', 'pronto', 'retirado', 'cancelado');
create type public.status_assinatura_cliente as enum ('pendente', 'ativa', 'cancelada');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------
create table public.planos_plataforma (
  id text primary key,
  nome text not null,
  preco_centavos integer not null,
  max_usuarios integer,            -- null = ilimitado
  recursos text[] not null default '{}',
  ordem integer not null default 0
);

insert into public.planos_plataforma (id, nome, preco_centavos, max_usuarios, recursos, ordem) values
  ('basico', 'Básico', 4900, 1, array['Agenda e clientes', 'Catálogo de serviços', 'Página de agendamento'], 1),
  ('profissional', 'Profissional', 9900, 5, array['Tudo do Básico', 'Pagamentos online', 'Loja de produtos', 'Financeiro', 'Cartão fidelidade'], 2),
  ('premium', 'Premium', 17900, null, array['Tudo do Profissional', 'Planos mensais para clientes', 'Usuários ilimitados', 'Fotos de antes e depois'], 3);

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  telefone text,
  is_admin boolean not null default false,
  criado_em timestamptz not null default now()
);

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descricao text,
  telefone text,
  whatsapp text,
  endereco text,
  cidade text,
  logo_url text,
  abre time not null default '08:00',
  fecha time not null default '18:00',
  dias_funcionamento smallint[] not null default '{1,2,3,4,5,6}', -- 0 = domingo
  vagas_simultaneas smallint not null default 2 check (vagas_simultaneas between 1 and 50),
  intervalo_minutos smallint not null default 30 check (intervalo_minutos between 10 and 240),
  fidelidade_ativa boolean not null default true,
  fidelidade_meta smallint not null default 10 check (fidelidade_meta between 2 and 50),
  aceita_pagamento_online boolean not null default false,
  plano_id text not null default 'profissional' references public.planos_plataforma (id),
  status_assinatura public.status_assinatura not null default 'teste',
  teste_ate timestamptz not null default (now() + interval '14 days'),
  assinatura_ate timestamptz,
  mp_assinatura_id text,
  criado_em timestamptz not null default now()
);

-- Segredos ficam fora do alcance do cliente (sem policies: só service role).
create table public.empresa_segredos (
  empresa_id uuid primary key references public.empresas (id) on delete cascade,
  mp_access_token text,
  atualizado_em timestamptz not null default now()
);

create table public.membros (
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  papel public.papel_membro not null default 'funcionario',
  criado_em timestamptz not null default now(),
  primary key (empresa_id, usuario_id)
);

create table public.convites (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  email text not null,
  papel public.papel_membro not null default 'funcionario',
  criado_em timestamptz not null default now(),
  unique (empresa_id, email)
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  usuario_id uuid references auth.users (id) on delete set null,
  nome text not null,
  telefone text,
  email text,
  observacoes text,
  selos smallint not null default 0,
  criado_em timestamptz not null default now(),
  unique (empresa_id, usuario_id)
);

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  placa text not null,
  modelo text,
  cor text,
  tipo text not null default 'carro' check (tipo in ('carro', 'moto', 'suv', 'caminhonete', 'van')),
  criado_em timestamptz not null default now()
);

create table public.servicos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  nome text not null,
  descricao text,
  preco_centavos integer not null check (preco_centavos >= 0),
  duracao_minutos smallint not null default 30 check (duracao_minutos between 10 and 600),
  ativo boolean not null default true,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  nome text not null,
  descricao text,
  preco_centavos integer not null check (preco_centavos >= 0),
  estoque integer not null default 0 check (estoque >= 0),
  foto_url text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.planos_cliente (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  servico_id uuid not null references public.servicos (id) on delete restrict,
  nome text not null,
  descricao text,
  preco_centavos integer not null check (preco_centavos >= 0),
  lavagens_mes smallint not null check (lavagens_mes between 1 and 60),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.assinaturas_cliente (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  plano_id uuid not null references public.planos_cliente (id) on delete restrict,
  status public.status_assinatura_cliente not null default 'pendente',
  valido_ate date,
  mes_referencia text not null default to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM'),
  lavagens_usadas smallint not null default 0,
  criado_em timestamptz not null default now()
);

create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  veiculo_id uuid references public.veiculos (id) on delete set null,
  servico_id uuid references public.servicos (id) on delete set null,
  servico_nome text not null,
  inicio timestamptz not null,
  fim timestamptz not null,
  status public.status_agendamento not null default 'agendado',
  valor_centavos integer not null default 0,
  forma_pagamento public.forma_pagamento not null default 'no_local',
  status_pagamento public.status_pagamento not null default 'pendente',
  mp_pagamento_id text,
  observacoes text,
  fotos_antes text[] not null default '{}',
  fotos_depois text[] not null default '{}',
  assinatura_id uuid references public.assinaturas_cliente (id) on delete set null,
  criado_em timestamptz not null default now(),
  check (fim > inicio)
);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  status public.status_pedido not null default 'aberto',
  total_centavos integer not null default 0,
  forma_pagamento public.forma_pagamento not null default 'no_local',
  status_pagamento public.status_pagamento not null default 'pendente',
  mp_pagamento_id text,
  criado_em timestamptz not null default now()
);

create table public.itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  produto_id uuid references public.produtos (id) on delete set null,
  produto_nome text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unit_centavos integer not null
);

create table public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  tipo public.tipo_lancamento not null,
  categoria text not null default 'outros',
  descricao text not null,
  valor_centavos integer not null check (valor_centavos > 0),
  data date not null default (now() at time zone 'America/Sao_Paulo')::date,
  agendamento_id uuid references public.agendamentos (id) on delete set null,
  pedido_id uuid references public.pedidos (id) on delete set null,
  assinatura_cliente_id uuid references public.assinaturas_cliente (id) on delete set null,
  criado_em timestamptz not null default now()
);

-- Índices
create index on public.membros (usuario_id);
create index on public.clientes (empresa_id);
create index on public.clientes (usuario_id);
create index on public.veiculos (cliente_id);
create index on public.veiculos (empresa_id);
create index on public.servicos (empresa_id);
create index on public.produtos (empresa_id);
create index on public.planos_cliente (empresa_id);
create index on public.assinaturas_cliente (cliente_id);
create index on public.assinaturas_cliente (empresa_id);
create index on public.agendamentos (empresa_id, inicio);
create index on public.agendamentos (cliente_id);
create index on public.pedidos (empresa_id, criado_em);
create index on public.pedidos (cliente_id);
create index on public.itens_pedido (pedido_id);
create index on public.lancamentos (empresa_id, data);
create index on public.convites (lower(email));

-- ---------------------------------------------------------------------------
-- Funções auxiliares de permissão
-- ---------------------------------------------------------------------------
create or replace function public.is_membro(p_empresa uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.membros m
    where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid())
  );
$$;

create or replace function public.is_dono(p_empresa uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.membros m
    where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid()) and m.papel = 'dono'
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_admin from public.perfis p where p.id = (select auth.uid())), false);
$$;

create or replace function public.is_meu_cliente(p_cliente uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.clientes c
    where c.id = p_cliente and c.usuario_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.planos_plataforma enable row level security;
alter table public.perfis enable row level security;
alter table public.empresas enable row level security;
alter table public.empresa_segredos enable row level security;
alter table public.membros enable row level security;
alter table public.convites enable row level security;
alter table public.clientes enable row level security;
alter table public.veiculos enable row level security;
alter table public.servicos enable row level security;
alter table public.produtos enable row level security;
alter table public.planos_cliente enable row level security;
alter table public.assinaturas_cliente enable row level security;
alter table public.agendamentos enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.lancamentos enable row level security;

create policy "planos visiveis" on public.planos_plataforma for select using (true);

create policy "perfil proprio" on public.perfis for select using (id = (select auth.uid()) or public.is_admin());
create policy "perfil proprio insere" on public.perfis for insert with check (id = (select auth.uid()));
create policy "perfil proprio atualiza" on public.perfis for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and is_admin = (select p.is_admin from public.perfis p where p.id = (select auth.uid())));

-- Vitrine pública: dados da empresa são abertos (segredos ficam em outra tabela).
create policy "empresa publica" on public.empresas for select using (true);
create policy "dono atualiza empresa" on public.empresas for update using (public.is_dono(id)) with check (public.is_dono(id));
create policy "admin atualiza empresa" on public.empresas for update using (public.is_admin()) with check (public.is_admin());

create policy "membros veem equipe" on public.membros for select using (usuario_id = (select auth.uid()) or public.is_membro(empresa_id) or public.is_admin());
create policy "dono remove membro" on public.membros for delete using (public.is_dono(empresa_id) and usuario_id <> (select auth.uid()));

create policy "dono gerencia convites" on public.convites for all using (public.is_dono(empresa_id)) with check (public.is_dono(empresa_id));

create policy "equipe gerencia clientes" on public.clientes for all using (public.is_membro(empresa_id)) with check (public.is_membro(empresa_id));
create policy "cliente ve proprio cadastro" on public.clientes for select using (usuario_id = (select auth.uid()));

create policy "equipe gerencia veiculos" on public.veiculos for all using (public.is_membro(empresa_id)) with check (public.is_membro(empresa_id));
create policy "cliente gerencia veiculos" on public.veiculos for all using (public.is_meu_cliente(cliente_id))
  with check (public.is_meu_cliente(cliente_id) and empresa_id = (select c.empresa_id from public.clientes c where c.id = cliente_id));

create policy "servicos publicos" on public.servicos for select using (ativo or public.is_membro(empresa_id));
create policy "dono gerencia servicos" on public.servicos for all using (public.is_dono(empresa_id)) with check (public.is_dono(empresa_id));

create policy "produtos publicos" on public.produtos for select using (ativo or public.is_membro(empresa_id));
create policy "dono gerencia produtos" on public.produtos for all using (public.is_dono(empresa_id)) with check (public.is_dono(empresa_id));

create policy "planos cliente publicos" on public.planos_cliente for select using (ativo or public.is_membro(empresa_id));
create policy "dono gerencia planos cliente" on public.planos_cliente for all using (public.is_dono(empresa_id)) with check (public.is_dono(empresa_id));

create policy "equipe gerencia assinaturas" on public.assinaturas_cliente for all using (public.is_membro(empresa_id)) with check (public.is_membro(empresa_id));
create policy "cliente ve assinaturas" on public.assinaturas_cliente for select using (public.is_meu_cliente(cliente_id));

create policy "equipe gerencia agendamentos" on public.agendamentos for all using (public.is_membro(empresa_id)) with check (public.is_membro(empresa_id));
create policy "cliente ve agendamentos" on public.agendamentos for select using (public.is_meu_cliente(cliente_id));

create policy "equipe gerencia pedidos" on public.pedidos for all using (public.is_membro(empresa_id)) with check (public.is_membro(empresa_id));
create policy "cliente ve pedidos" on public.pedidos for select using (public.is_meu_cliente(cliente_id));

create policy "equipe ve itens" on public.itens_pedido for all using (public.is_membro(empresa_id)) with check (public.is_membro(empresa_id));
create policy "cliente ve itens" on public.itens_pedido for select using (
  exists (select 1 from public.pedidos p where p.id = pedido_id and public.is_meu_cliente(p.cliente_id))
);

-- Financeiro: só o dono.
create policy "dono gerencia financeiro" on public.lancamentos for all using (public.is_dono(empresa_id)) with check (public.is_dono(empresa_id));

-- ---------------------------------------------------------------------------
-- Gatilhos
-- ---------------------------------------------------------------------------

-- Cria o perfil ao cadastrar e aceita convites pendentes pelo e-mail.
create or replace function public.ao_criar_usuario()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, nome, telefone)
  values (new.id, new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'telefone')
  on conflict (id) do nothing;

  insert into public.membros (empresa_id, usuario_id, papel)
  select c.empresa_id, new.id, c.papel from public.convites c
  where lower(c.email) = lower(new.email)
  on conflict do nothing;

  delete from public.convites c where lower(c.email) = lower(new.email);
  return new;
end;
$$;

create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.ao_criar_usuario();

-- Plano e assinatura da empresa só mudam pelo webhook de pagamento ou pelo admin.
create or replace function public.proteger_assinatura_empresa()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce((select auth.role()), '') <> 'service_role' and not public.is_admin() then
    new.plano_id := old.plano_id;
    new.status_assinatura := old.status_assinatura;
    new.teste_ate := old.teste_ate;
    new.assinatura_ate := old.assinatura_ate;
    new.mp_assinatura_id := old.mp_assinatura_id;
  end if;
  -- Pagamento online só liga se houver token do Mercado Pago salvo.
  if new.aceita_pagamento_online then
    new.aceita_pagamento_online := exists (
      select 1 from public.empresa_segredos s where s.empresa_id = new.id and s.mp_access_token is not null
    );
  end if;
  return new;
end;
$$;

create trigger proteger_assinatura_empresa before update on public.empresas
  for each row execute function public.proteger_assinatura_empresa();

-- Lançamento automático no caixa quando um pagamento é confirmado.
create or replace function public.lancar_pagamento_agendamento()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status_pagamento = 'pago' and (tg_op = 'INSERT' or old.status_pagamento is distinct from 'pago')
     and new.valor_centavos > 0 then
    insert into public.lancamentos (empresa_id, tipo, categoria, descricao, valor_centavos, agendamento_id)
    values (new.empresa_id, 'entrada', 'servicos', 'Lavagem: ' || new.servico_nome, new.valor_centavos, new.id);
  end if;
  return new;
end;
$$;

create trigger lancar_pagamento_agendamento after insert or update of status_pagamento on public.agendamentos
  for each row execute function public.lancar_pagamento_agendamento();

create or replace function public.lancar_pagamento_pedido()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status_pagamento = 'pago' and (tg_op = 'INSERT' or old.status_pagamento is distinct from 'pago')
     and new.total_centavos > 0 then
    insert into public.lancamentos (empresa_id, tipo, categoria, descricao, valor_centavos, pedido_id)
    values (new.empresa_id, 'entrada', 'produtos', 'Venda de produtos', new.total_centavos, new.id);
  end if;
  return new;
end;
$$;

create trigger lancar_pagamento_pedido after insert or update of status_pagamento on public.pedidos
  for each row execute function public.lancar_pagamento_pedido();

-- Devolve estoque ao cancelar um pedido.
create or replace function public.devolver_estoque_pedido()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    update public.produtos p set estoque = p.estoque + i.quantidade
    from public.itens_pedido i where i.pedido_id = new.id and i.produto_id = p.id;
  end if;
  return new;
end;
$$;

create trigger devolver_estoque_pedido after update of status on public.pedidos
  for each row execute function public.devolver_estoque_pedido();

-- Cartão fidelidade: um selo a cada lavagem paga entregue.
create or replace function public.contar_selo_fidelidade()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_ativa boolean;
begin
  if new.status = 'entregue' and old.status is distinct from 'entregue'
     and new.forma_pagamento not in ('fidelidade', 'plano') then
    select e.fidelidade_ativa into v_ativa from public.empresas e where e.id = new.empresa_id;
    if v_ativa then
      update public.clientes set selos = selos + 1 where id = new.cliente_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger contar_selo_fidelidade after update of status on public.agendamentos
  for each row execute function public.contar_selo_fidelidade();

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Dono cria o lava rápido no cadastro.
create or replace function public.criar_empresa(p_nome text, p_slug text, p_telefone text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'Faça login primeiro'; end if;
  if exists (select 1 from public.membros m where m.usuario_id = v_uid and m.papel = 'dono') then
    raise exception 'Você já tem um lava rápido cadastrado';
  end if;

  insert into public.perfis (id) values (v_uid) on conflict do nothing;

  insert into public.empresas (nome, slug, telefone, whatsapp)
  values (trim(p_nome), lower(trim(p_slug)), p_telefone, p_telefone)
  returning id into v_id;

  insert into public.membros (empresa_id, usuario_id, papel) values (v_id, v_uid, 'dono');

  -- Catálogo inicial para o dono não começar do zero.
  insert into public.servicos (empresa_id, nome, descricao, preco_centavos, duracao_minutos, ordem) values
    (v_id, 'Lavagem simples', 'Externa com secagem', 4000, 30, 1),
    (v_id, 'Lavagem completa', 'Externa, interna e aspiração', 7000, 60, 2),
    (v_id, 'Polimento', 'Polimento e cera de proteção', 18000, 180, 3);
  return v_id;
end;
$$;

-- Cliente final se vincula a um lava rápido (cria ou atualiza o cadastro).
create or replace function public.vincular_cliente(p_empresa uuid, p_nome text, p_telefone text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_uid uuid := (select auth.uid());
  v_email text;
begin
  if v_uid is null then raise exception 'Faça login primeiro'; end if;
  select u.email into v_email from auth.users u where u.id = v_uid;

  insert into public.clientes (empresa_id, usuario_id, nome, telefone, email)
  values (p_empresa, v_uid, trim(p_nome), p_telefone, v_email)
  on conflict (empresa_id, usuario_id) do update
    set nome = excluded.nome, telefone = coalesce(excluded.telefone, public.clientes.telefone)
  returning id into v_id;
  return v_id;
end;
$$;

-- Horários livres de um dia para um serviço.
create or replace function public.horarios_disponiveis(p_empresa uuid, p_data date, p_servico uuid)
returns table (inicio timestamptz) language plpgsql stable security definer set search_path = '' as $$
declare
  e public.empresas;
  v_duracao integer;
  v_slot timestamp;
  v_ultimo timestamp;
begin
  select * into e from public.empresas where id = p_empresa;
  if not found then return; end if;
  if not (extract(dow from p_data)::smallint = any (e.dias_funcionamento)) then return; end if;

  select s.duracao_minutos into v_duracao from public.servicos s
  where s.id = p_servico and s.empresa_id = p_empresa and s.ativo;
  if v_duracao is null then return; end if;

  v_slot := p_data + e.abre;
  v_ultimo := p_data + e.fecha - make_interval(mins => v_duracao);

  while v_slot <= v_ultimo loop
    if (v_slot at time zone 'America/Sao_Paulo') > now() + interval '15 minutes'
       and (
         select count(*) from public.agendamentos a
         where a.empresa_id = p_empresa
           and a.status <> 'cancelado'
           and a.inicio < (v_slot + make_interval(mins => v_duracao)) at time zone 'America/Sao_Paulo'
           and a.fim > v_slot at time zone 'America/Sao_Paulo'
       ) < e.vagas_simultaneas then
      inicio := v_slot at time zone 'America/Sao_Paulo';
      return next;
    end if;
    v_slot := v_slot + make_interval(mins => e.intervalo_minutos);
  end loop;
end;
$$;

-- Cliente agenda uma lavagem.
-- p_forma: 'pix' | 'cartao' (pagamento online), 'no_local', 'plano', 'fidelidade'
create or replace function public.criar_agendamento(
  p_empresa uuid, p_veiculo uuid, p_servico uuid, p_inicio timestamptz,
  p_forma public.forma_pagamento default 'no_local', p_observacoes text default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_cliente public.clientes;
  v_servico public.servicos;
  v_empresa public.empresas;
  v_assinatura public.assinaturas_cliente;
  v_valor integer;
  v_id uuid;
  v_mes text := to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM');
begin
  if v_uid is null then raise exception 'Faça login primeiro'; end if;

  select * into v_cliente from public.clientes where empresa_id = p_empresa and usuario_id = v_uid;
  if not found then raise exception 'Complete seu cadastro antes de agendar'; end if;

  if not exists (select 1 from public.veiculos where id = p_veiculo and cliente_id = v_cliente.id) then
    raise exception 'Veículo inválido';
  end if;

  select * into v_servico from public.servicos where id = p_servico and empresa_id = p_empresa and ativo;
  if not found then raise exception 'Serviço indisponível'; end if;

  select * into v_empresa from public.empresas where id = p_empresa for update; -- serializa agendamentos

  if not exists (select 1 from public.horarios_disponiveis(p_empresa, (p_inicio at time zone 'America/Sao_Paulo')::date, p_servico) h
                 where h.inicio = p_inicio) then
    raise exception 'Esse horário acabou de ser ocupado. Escolha outro.';
  end if;

  v_valor := v_servico.preco_centavos;

  if p_forma = 'plano' then
    select a.* into v_assinatura from public.assinaturas_cliente a
      join public.planos_cliente pc on pc.id = a.plano_id
    where a.cliente_id = v_cliente.id and a.status = 'ativa' and pc.servico_id = p_servico
      and (a.valido_ate is null or a.valido_ate >= current_date)
    order by a.criado_em desc limit 1
    for update of a;
    if not found then raise exception 'Você não tem um plano ativo para esse serviço'; end if;
    if v_assinatura.mes_referencia <> v_mes then
      update public.assinaturas_cliente set mes_referencia = v_mes, lavagens_usadas = 0 where id = v_assinatura.id
      returning * into v_assinatura;
    end if;
    if v_assinatura.lavagens_usadas >= (select lavagens_mes from public.planos_cliente where id = v_assinatura.plano_id) then
      raise exception 'Você já usou todas as lavagens do plano neste mês';
    end if;
    update public.assinaturas_cliente set lavagens_usadas = lavagens_usadas + 1 where id = v_assinatura.id;
    v_valor := 0;
  elsif p_forma = 'fidelidade' then
    if not v_empresa.fidelidade_ativa or v_cliente.selos < v_empresa.fidelidade_meta then
      raise exception 'Selos insuficientes para a lavagem grátis';
    end if;
    update public.clientes set selos = selos - v_empresa.fidelidade_meta where id = v_cliente.id;
    v_valor := 0;
  elsif p_forma in ('pix', 'cartao') then
    if not v_empresa.aceita_pagamento_online then
      raise exception 'Este lava rápido ainda não aceita pagamento online';
    end if;
  elsif p_forma <> 'no_local' then
    raise exception 'Forma de pagamento inválida';
  end if;

  insert into public.agendamentos (
    empresa_id, cliente_id, veiculo_id, servico_id, servico_nome, inicio, fim,
    valor_centavos, forma_pagamento, status_pagamento, observacoes, assinatura_id
  ) values (
    p_empresa, v_cliente.id, p_veiculo, p_servico, v_servico.nome, p_inicio,
    p_inicio + make_interval(mins => v_servico.duracao_minutos),
    v_valor, p_forma, case when v_valor = 0 then 'pago'::public.status_pagamento else 'pendente' end,
    nullif(trim(p_observacoes), ''), v_assinatura.id
  ) returning id into v_id;

  return v_id;
end;
$$;

-- Cliente cancela um agendamento ainda não iniciado.
create or replace function public.cancelar_agendamento(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  a public.agendamentos;
  v_meta smallint;
begin
  select * into a from public.agendamentos where id = p_id for update;
  if not found or not (public.is_meu_cliente(a.cliente_id) or public.is_membro(a.empresa_id)) then
    raise exception 'Agendamento não encontrado';
  end if;
  if a.status <> 'agendado' then raise exception 'Só dá para cancelar antes da lavagem começar'; end if;

  update public.agendamentos set status = 'cancelado' where id = p_id;

  if a.forma_pagamento = 'fidelidade' then
    select fidelidade_meta into v_meta from public.empresas where id = a.empresa_id;
    update public.clientes set selos = selos + v_meta where id = a.cliente_id;
  elsif a.forma_pagamento = 'plano' and a.assinatura_id is not null then
    update public.assinaturas_cliente set lavagens_usadas = greatest(lavagens_usadas - 1, 0) where id = a.assinatura_id;
  end if;
end;
$$;

-- Cliente compra produtos para retirar no lava rápido.
-- p_itens: [{"produto_id": "...", "quantidade": 2}]
create or replace function public.criar_pedido(p_empresa uuid, p_itens jsonb, p_forma public.forma_pagamento default 'no_local')
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_cliente uuid;
  v_pedido uuid;
  v_total integer := 0;
  v_item jsonb;
  v_prod public.produtos;
  v_qtd integer;
begin
  if v_uid is null then raise exception 'Faça login primeiro'; end if;
  select id into v_cliente from public.clientes where empresa_id = p_empresa and usuario_id = v_uid;
  if v_cliente is null then raise exception 'Complete seu cadastro antes de comprar'; end if;
  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then raise exception 'Carrinho vazio'; end if;
  if p_forma not in ('no_local', 'pix', 'cartao') then raise exception 'Forma de pagamento inválida'; end if;
  if p_forma <> 'no_local' and not (select aceita_pagamento_online from public.empresas where id = p_empresa) then
    raise exception 'Este lava rápido ainda não aceita pagamento online';
  end if;

  insert into public.pedidos (empresa_id, cliente_id, forma_pagamento) values (p_empresa, v_cliente, p_forma)
  returning id into v_pedido;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item ->> 'quantidade')::integer;
    if v_qtd is null or v_qtd < 1 then raise exception 'Quantidade inválida'; end if;
    select * into v_prod from public.produtos
      where id = (v_item ->> 'produto_id')::uuid and empresa_id = p_empresa and ativo for update;
    if not found then raise exception 'Produto indisponível'; end if;
    if v_prod.estoque < v_qtd then raise exception 'Estoque insuficiente de %', v_prod.nome; end if;
    update public.produtos set estoque = estoque - v_qtd where id = v_prod.id;
    insert into public.itens_pedido (pedido_id, empresa_id, produto_id, produto_nome, quantidade, preco_unit_centavos)
    values (v_pedido, p_empresa, v_prod.id, v_prod.nome, v_qtd, v_prod.preco_centavos);
    v_total := v_total + v_qtd * v_prod.preco_centavos;
  end loop;

  update public.pedidos set total_centavos = v_total where id = v_pedido;
  return v_pedido;
end;
$$;

-- Cliente pede para assinar um plano mensal (fica pendente até o pagamento).
create or replace function public.assinar_plano_cliente(p_plano uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_plano public.planos_cliente;
  v_cliente uuid;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Faça login primeiro'; end if;
  select * into v_plano from public.planos_cliente where id = p_plano and ativo;
  if not found then raise exception 'Plano indisponível'; end if;
  select id into v_cliente from public.clientes where empresa_id = v_plano.empresa_id and usuario_id = v_uid;
  if v_cliente is null then raise exception 'Complete seu cadastro antes de assinar'; end if;
  if exists (select 1 from public.assinaturas_cliente where cliente_id = v_cliente and plano_id = p_plano and status in ('pendente', 'ativa')) then
    raise exception 'Você já tem esse plano';
  end if;
  insert into public.assinaturas_cliente (empresa_id, cliente_id, plano_id)
  values (v_plano.empresa_id, v_cliente, p_plano) returning id into v_id;
  return v_id;
end;
$$;

-- Equipe confirma o pagamento de um plano mensal (ativa por 1 mês e lança no caixa).
create or replace function public.ativar_assinatura_cliente(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  a public.assinaturas_cliente;
  v_plano public.planos_cliente;
begin
  select * into a from public.assinaturas_cliente where id = p_id for update;
  if not found or not (public.is_membro(a.empresa_id) or (select auth.role()) = 'service_role') then
    raise exception 'Assinatura não encontrada';
  end if;
  select * into v_plano from public.planos_cliente where id = a.plano_id;
  update public.assinaturas_cliente
    set status = 'ativa',
        valido_ate = greatest(coalesce(valido_ate, current_date), current_date) + interval '1 month'
    where id = p_id;
  insert into public.lancamentos (empresa_id, tipo, categoria, descricao, valor_centavos, assinatura_cliente_id)
  select a.empresa_id, 'entrada', 'planos', 'Plano mensal: ' || v_plano.nome, v_plano.preco_centavos, a.id
  where v_plano.preco_centavos > 0;
end;
$$;

-- Dono convida alguém da equipe pelo e-mail (se já tiver conta, entra direto).
create or replace function public.convidar_membro(p_empresa uuid, p_email text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid;
  v_max integer;
  v_total integer;
begin
  if not public.is_dono(p_empresa) then raise exception 'Só o dono pode convidar'; end if;
  select pp.max_usuarios into v_max from public.empresas e join public.planos_plataforma pp on pp.id = e.plano_id where e.id = p_empresa;
  select count(*) into v_total from public.membros where empresa_id = p_empresa;
  select v_total + count(*) into v_total from public.convites where empresa_id = p_empresa;
  if v_max is not null and v_total >= v_max then
    raise exception 'Seu plano permite até % usuário(s). Faça upgrade para adicionar mais.', v_max;
  end if;

  select id into v_user from auth.users where lower(email) = lower(trim(p_email));
  if v_user is not null then
    insert into public.membros (empresa_id, usuario_id, papel) values (p_empresa, v_user, 'funcionario')
    on conflict do nothing;
    return 'adicionado';
  end if;
  insert into public.convites (empresa_id, email) values (p_empresa, lower(trim(p_email))) on conflict do nothing;
  return 'convidado';
end;
$$;

-- Dono salva o token do Mercado Pago (gravado fora do alcance do navegador).
create or replace function public.salvar_token_mp(p_empresa uuid, p_token text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_dono(p_empresa) then raise exception 'Só o dono pode alterar'; end if;
  insert into public.empresa_segredos (empresa_id, mp_access_token, atualizado_em)
  values (p_empresa, nullif(trim(p_token), ''), now())
  on conflict (empresa_id) do update set mp_access_token = excluded.mp_access_token, atualizado_em = now();
  update public.empresas set aceita_pagamento_online = (nullif(trim(p_token), '') is not null) where id = p_empresa;
end;
$$;

-- Lista da equipe com nome e e-mail (só para membros da empresa).
create or replace function public.listar_equipe(p_empresa uuid)
returns table (usuario_id uuid, nome text, email text, papel public.papel_membro)
language sql stable security definer set search_path = '' as $$
  select m.usuario_id, p.nome, u.email::text, m.papel
  from public.membros m
  join auth.users u on u.id = m.usuario_id
  left join public.perfis p on p.id = m.usuario_id
  where m.empresa_id = p_empresa and public.is_membro(p_empresa)
  order by m.papel, p.nome;
$$;

-- Permissões de execução
revoke execute on all functions in schema public from public, anon;
grant execute on function public.horarios_disponiveis(uuid, date, uuid) to anon, authenticated;
grant execute on function public.is_membro(uuid), public.is_dono(uuid), public.is_admin(), public.is_meu_cliente(uuid) to anon;
grant execute on function
  public.is_membro(uuid), public.is_dono(uuid), public.is_admin(), public.is_meu_cliente(uuid),
  public.criar_empresa(text, text, text), public.vincular_cliente(uuid, text, text),
  public.criar_agendamento(uuid, uuid, uuid, timestamptz, public.forma_pagamento, text),
  public.cancelar_agendamento(uuid), public.criar_pedido(uuid, jsonb, public.forma_pagamento),
  public.assinar_plano_cliente(uuid), public.ativar_assinatura_cliente(uuid),
  public.convidar_membro(uuid, text), public.salvar_token_mp(uuid, text), public.listar_equipe(uuid)
to authenticated;
grant execute on function public.ativar_assinatura_cliente(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Storage: fotos de antes/depois, logos e produtos (pasta = id da empresa)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) on conflict (id) do nothing;

create policy "equipe envia fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.is_membro(((storage.foldername(name))[1])::uuid));
create policy "equipe apaga fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.is_membro(((storage.foldername(name))[1])::uuid));
