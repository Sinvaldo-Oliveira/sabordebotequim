-- =============================================================
-- Sabor de Botequim — Votação por WhatsApp (OTP)
--
-- Substitui a identificação por CPF por confirmação via código
-- enviado ao WhatsApp. O CPF continua existindo em votes (colunas
-- agora anuláveis) para não quebrar o histórico/seed, mas o novo
-- fluxo grava whatsapp_hash/whatsapp_encrypted/whatsapp_last_digits.
--
-- Segredos (salt de hash, chave de criptografia, pepper do OTP)
-- vivem na aplicação; o código OTP em texto puro NUNCA chega ao
-- banco — apenas o hash (sha256(otp || pepper)) calculado no Node.
-- =============================================================

-- ---------------------------------------------------------------
-- Enum de status da verificação
-- ---------------------------------------------------------------

create type public.verification_status as enum (
  'pending',
  'verified',
  'expired',
  'blocked',
  'used',
  'cancelled'
);

-- Nova regra de votação (identidade por WhatsApp, 1 voto por edição).
alter type public.voting_rule add value if not exists 'one_vote_per_whatsapp_per_festival';

-- ---------------------------------------------------------------
-- votes — adapta para WhatsApp mantendo compatibilidade com CPF
-- ---------------------------------------------------------------

alter table public.votes alter column voter_cpf_hash drop not null;
alter table public.votes alter column voter_cpf_encrypted drop not null;
alter table public.votes alter column voter_cpf_last_digits drop not null;

alter table public.votes add column if not exists whatsapp_hash text;
alter table public.votes add column if not exists whatsapp_encrypted text;
alter table public.votes add column if not exists whatsapp_last_digits text;
alter table public.votes add column if not exists verification_id bigint;

create index if not exists votes_whatsapp_hash_idx on public.votes (whatsapp_hash);

-- Regra inicial "one_vote_per_whatsapp_per_festival" reforçada no banco:
-- no máximo um voto válido por número dentro do mesmo festival. Votos
-- invalidados/cancelados NÃO ocupam a vaga (predicado status = 'valid'),
-- permitindo que a administração invalide um voto e o número vote de novo.
create unique index if not exists votes_one_valid_per_whatsapp_per_festival_idx
  on public.votes (festival_id, whatsapp_hash)
  where status = 'valid' and whatsapp_hash is not null;

-- ---------------------------------------------------------------
-- vote_verifications — ciclo de vida do código OTP
-- ---------------------------------------------------------------

create table public.vote_verifications (
  id bigint generated always as identity primary key,
  festival_id uuid not null references public.festivals (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null references public.voting_categories (id) on delete cascade,
  dish_id uuid references public.dishes (id) on delete set null,
  voter_name text not null,
  whatsapp_hash text not null,
  whatsapp_encrypted text not null,
  whatsapp_last_digits text not null,
  otp_hash text not null,
  otp_expires_at timestamptz not null,
  otp_attempts integer not null default 0,
  otp_max_attempts integer not null default 5,
  resend_count integer not null default 1,
  last_sent_at timestamptz not null default now(),
  status public.verification_status not null default 'pending',
  consent_regulation boolean not null,
  consent_privacy boolean not null,
  terms_version text not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  used_at timestamptz,
  constraint vote_verifications_last_digits_check
    check (char_length(whatsapp_last_digits) = 4)
);

create index vote_verifications_festival_id_idx on public.vote_verifications (festival_id);
create index vote_verifications_restaurant_id_idx on public.vote_verifications (restaurant_id);
create index vote_verifications_category_id_idx on public.vote_verifications (category_id);
create index vote_verifications_whatsapp_hash_idx on public.vote_verifications (whatsapp_hash);
create index vote_verifications_status_idx on public.vote_verifications (status);
create index vote_verifications_expires_at_idx on public.vote_verifications (otp_expires_at);

-- No máximo uma verificação "viva" por número + festival: ao pedir um novo
-- código, a mesma linha é reutilizada (o código anterior é sobrescrito).
create unique index vote_verifications_active_per_whatsapp_idx
  on public.vote_verifications (festival_id, whatsapp_hash)
  where status in ('pending', 'verified');

alter table public.votes
  add constraint votes_verification_id_fkey
  foreign key (verification_id) references public.vote_verifications (id) on delete set null;

-- ---------------------------------------------------------------
-- RLS — verificações nunca são legíveis pelo público; escrita só
-- via funções SECURITY DEFINER. Admin pode ler para métricas.
-- ---------------------------------------------------------------

alter table public.vote_verifications enable row level security;
alter table public.vote_verifications force row level security;

create policy vote_verifications_select_admin
  on public.vote_verifications for select
  to authenticated
  using ((select private.is_admin()));
