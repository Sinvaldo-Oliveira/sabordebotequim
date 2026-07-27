-- =============================================================
-- Sabor de Botequim — Votos, analytics, aprovações e auditoria
-- =============================================================

-- ---------------------------------------------------------------
-- votes
--
-- O CPF nunca é armazenado em texto puro:
--   voter_cpf_hash       — sha256(cpf + salt), usado para detectar duplicidade
--   voter_cpf_encrypted  — pgp_sym_encrypt(cpf, chave), acesso só via função
--                          restrita a superadmin (auditada)
--   voter_cpf_last_digits — últimos 2 dígitos, para exibição mascarada
--
-- Mutações (INSERT/UPDATE) só acontecem através das funções
-- register_vote() e moderate_vote() (ver migration de funções) —
-- não há policy de INSERT/UPDATE direto para nenhum papel.
-- ---------------------------------------------------------------

create table public.votes (
  id bigint generated always as identity primary key,
  festival_id uuid not null references public.festivals (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  dish_id uuid references public.dishes (id) on delete set null,
  category_id uuid not null references public.voting_categories (id) on delete cascade,
  voter_name text not null,
  voter_cpf_hash text not null,
  voter_cpf_encrypted text not null,
  voter_cpf_last_digits text not null,
  protocol text not null unique,
  status public.vote_status not null default 'valid',
  consent_privacy boolean not null,
  consent_regulation boolean not null,
  terms_version text not null,
  ip_hash text,
  user_agent text,
  risk_score integer not null default 0,
  risk_reasons jsonb not null default '[]'::jsonb,
  moderation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  invalidated_at timestamptz,
  invalidated_by uuid references public.profiles (id) on delete set null,
  invalidation_reason text,
  constraint votes_cpf_last_digits_check check (char_length(voter_cpf_last_digits) = 2)
);

create index votes_festival_id_idx on public.votes (festival_id);
create index votes_restaurant_id_idx on public.votes (restaurant_id);
create index votes_dish_id_idx on public.votes (dish_id);
create index votes_category_id_idx on public.votes (category_id);
create index votes_invalidated_by_idx on public.votes (invalidated_by);
create index votes_status_idx on public.votes (status);
create index votes_created_at_idx on public.votes (created_at);

-- Backstop de duplicidade (defesa em profundidade): nunca permite duas
-- votos válidos/em análise do mesmo CPF na mesma categoria, independente
-- da regra configurada — a regra específica (por festival/restaurante/
-- período) é reforçada em register_vote() com lock de aplicação.
create unique index votes_no_duplicate_per_category_idx
  on public.votes (festival_id, category_id, voter_cpf_hash)
  where status in ('valid', 'under_review');

create trigger set_updated_at
  before update on public.votes
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------
-- analytics_events — eventos internos de rastreamento
-- ---------------------------------------------------------------

create table public.analytics_events (
  id bigint generated always as identity primary key,
  festival_id uuid references public.festivals (id) on delete cascade,
  restaurant_id uuid references public.restaurants (id) on delete cascade,
  category_id uuid references public.voting_categories (id) on delete set null,
  event_name text not null,
  session_id text,
  page_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  operating_system text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_festival_event_idx
  on public.analytics_events (festival_id, event_name, created_at);
create index analytics_events_restaurant_id_idx
  on public.analytics_events (restaurant_id, created_at);

-- ---------------------------------------------------------------
-- restaurant_change_requests — fluxo de aprovação de alterações
-- ---------------------------------------------------------------

create table public.restaurant_change_requests (
  id bigint generated always as identity primary key,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  requested_by uuid references public.profiles (id) on delete set null,
  current_data jsonb not null,
  requested_data jsonb not null,
  status public.change_request_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

create index restaurant_change_requests_restaurant_id_idx
  on public.restaurant_change_requests (restaurant_id);
create index restaurant_change_requests_status_idx
  on public.restaurant_change_requests (status);

-- ---------------------------------------------------------------
-- audit_logs — trilha imutável de ações administrativas
-- ---------------------------------------------------------------

create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at);
