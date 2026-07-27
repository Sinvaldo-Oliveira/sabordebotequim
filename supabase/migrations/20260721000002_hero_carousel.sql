-- =============================================================
-- Sabor de Botequim — Carrossel (Slider-Hero) da landing page
--
-- Slides do topo da home (proporção 1920×1080). Cada slide tem
-- imagem e, opcionalmente, título/subtítulo/CTA sobrepostos. A
-- configuração global (autoplay, ligar/desligar) fica em
-- system_settings sob a chave "public_hero_carousel".
-- =============================================================

create table public.hero_slides (
  id bigint generated always as identity primary key,
  festival_id uuid not null references public.festivals (id) on delete cascade,
  image_url text not null,
  title text,
  subtitle text,
  cta_label text,
  cta_href text,
  overlay_opacity integer not null default 35,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hero_slides_overlay_opacity_check
    check (overlay_opacity between 0 and 90)
);

create index hero_slides_festival_id_idx on public.hero_slides (festival_id, display_order);
create index hero_slides_active_idx on public.hero_slides (festival_id, is_active);

create trigger set_updated_at
  before update on public.hero_slides
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------
-- RLS — leitura pública dos slides ativos; gestão só para admin.
-- ---------------------------------------------------------------

alter table public.hero_slides enable row level security;
alter table public.hero_slides force row level security;

create policy hero_slides_select_public
  on public.hero_slides for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.festivals f
      where f.id = festival_id and f.status <> 'draft'
    )
  );

create policy hero_slides_select_admin
  on public.hero_slides for select
  to authenticated
  using ((select private.is_admin()));

create policy hero_slides_write_admin
  on public.hero_slides for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- Storage — bucket festival-media (banners do carrossel etc.).
-- Leitura pública; escrita restrita a administradores.
-- ---------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'festival-media',
  'festival-media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy festival_media_insert
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'festival-media' and (select private.is_admin()));

create policy festival_media_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'festival-media' and (select private.is_admin()));

create policy festival_media_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'festival-media' and (select private.is_admin()));
