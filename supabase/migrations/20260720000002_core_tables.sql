-- =============================================================
-- Sabor de Botequim — Tabelas principais
-- =============================================================

-- ---------------------------------------------------------------
-- profiles — estende auth.users com papel e dados de exibição
-- ---------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'restaurant',
  status public.entity_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Cria automaticamente um profile ao registrar um usuário no Supabase Auth.
-- O papel default é 'restaurant'; contas administrativas têm o papel
-- promovido logo em seguida por uma Server Action com service role.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, status)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'restaurant'),
    'active'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------
-- festivals — raiz multi-tenant (preparado para futuras edições)
-- ---------------------------------------------------------------

create table public.festivals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  start_date date,
  end_date date,
  voting_start_at timestamptz,
  voting_end_at timestamptz,
  timezone text not null default 'America/Sao_Paulo',
  status public.festival_status not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index festivals_status_idx on public.festivals (status);

create trigger set_updated_at
  before update on public.festivals
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------
-- voting_categories — categorias de exibição/votação (ex.: "Melhor
-- petisco"). Cada categoria carrega sua própria regra de votação.
-- ---------------------------------------------------------------

create table public.voting_categories (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  voting_rule public.voting_rule not null default 'one_per_category',
  period_hours integer,
  voting_start_at timestamptz,
  voting_end_at timestamptz,
  status public.entity_status not null default 'active',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint voting_categories_festival_slug_key unique (festival_id, slug),
  constraint voting_categories_period_hours_check check (
    voting_rule <> 'one_per_period' or period_hours is not null
  )
);

create index voting_categories_festival_id_idx on public.voting_categories (festival_id);
create index voting_categories_status_idx on public.voting_categories (status);

create trigger set_updated_at
  before update on public.voting_categories
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals (id) on delete cascade,
  owner_user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  slug text not null,
  short_description text,
  description text,
  story text,
  category_id uuid references public.voting_categories (id) on delete set null,
  logo_url text,
  banner_url text,
  phone text,
  whatsapp text,
  email text,
  website text,
  instagram text,
  facebook text,
  tiktok text,
  address text,
  number text,
  complement text,
  neighborhood text,
  city text not null default 'Ribeirão das Neves',
  state text not null default 'MG',
  postal_code text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  opening_hours jsonb not null default '{}'::jsonb,
  status public.entity_status not null default 'pending',
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint restaurants_festival_slug_key unique (festival_id, slug)
);

create index restaurants_festival_id_idx on public.restaurants (festival_id, status);
create index restaurants_owner_user_id_idx on public.restaurants (owner_user_id);
create index restaurants_category_id_idx on public.restaurants (category_id);
create index restaurants_name_trgm_idx on public.restaurants using gin (name extensions.gin_trgm_ops);

create trigger set_updated_at
  before update on public.restaurants
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------
-- dishes — prato participante de cada restaurante
-- ---------------------------------------------------------------

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid references public.voting_categories (id) on delete set null,
  name text not null,
  description text,
  story text,
  ingredients text,
  dietary_information text,
  price numeric(10, 2),
  main_image_url text,
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dishes_restaurant_id_idx on public.dishes (restaurant_id);
create index dishes_category_id_idx on public.dishes (category_id);

create trigger set_updated_at
  before update on public.dishes
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------
-- restaurant_gallery
-- ---------------------------------------------------------------

create table public.restaurant_gallery (
  id bigint generated always as identity primary key,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index restaurant_gallery_restaurant_id_idx on public.restaurant_gallery (restaurant_id);

-- ---------------------------------------------------------------
-- sponsors
-- ---------------------------------------------------------------

create table public.sponsors (
  id bigint generated always as identity primary key,
  festival_id uuid not null references public.festivals (id) on delete cascade,
  name text not null,
  logo_url text,
  website_url text,
  sponsorship_level text,
  status public.entity_status not null default 'active',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index sponsors_festival_id_idx on public.sponsors (festival_id, status);

-- ---------------------------------------------------------------
-- landing_sections — conteúdo editável da landing page
-- ---------------------------------------------------------------

create table public.landing_sections (
  id bigint generated always as identity primary key,
  festival_id uuid not null references public.festivals (id) on delete cascade,
  section_key text not null,
  title text,
  subtitle text,
  content jsonb not null default '{}'::jsonb,
  image_url text,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint landing_sections_festival_section_key unique (festival_id, section_key)
);

create index landing_sections_festival_id_idx on public.landing_sections (festival_id);

create trigger set_updated_at
  before update on public.landing_sections
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------
-- system_settings — chave/valor genérico (tema, SEO, integrações)
-- ---------------------------------------------------------------

create table public.system_settings (
  id bigint generated always as identity primary key,
  festival_id uuid references public.festivals (id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint system_settings_festival_key_key unique (festival_id, setting_key)
);

create index system_settings_festival_id_idx on public.system_settings (festival_id);

create trigger set_updated_at
  before update on public.system_settings
  for each row execute function private.set_updated_at();
