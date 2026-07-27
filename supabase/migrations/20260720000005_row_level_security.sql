-- =============================================================
-- Sabor de Botequim — Row Level Security
--
-- Convenções:
--   * RLS habilitada e forçada (FORCE) em toda tabela — nem o dono
--     da tabela escapa das policies fora de contexto SECURITY DEFINER.
--   * Funções auxiliares (private.*) são sempre chamadas como
--     (select private.fn()) para serem avaliadas uma vez por
--     consulta, não uma vez por linha.
--   * votes e audit_logs não têm nenhuma policy de escrita: toda
--     mutação passa por função SECURITY DEFINER (migration seguinte).
-- =============================================================

-- ---------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy profiles_select_admin
  on public.profiles for select
  to authenticated
  using ((select private.is_admin()));

-- INSERT é feito pelo trigger private.handle_new_user() (security definer).
-- UPDATE de papel/status é feito por Server Actions com service role;
-- edição do próprio nome/avatar passa pela função update_own_profile().

-- ---------------------------------------------------------------
-- festivals
-- ---------------------------------------------------------------

alter table public.festivals enable row level security;
alter table public.festivals force row level security;

create policy festivals_select_public
  on public.festivals for select
  to anon, authenticated
  using (status <> 'draft');

create policy festivals_select_admin
  on public.festivals for select
  to authenticated
  using ((select private.is_admin()));

create policy festivals_write_admin
  on public.festivals for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- voting_categories
-- ---------------------------------------------------------------

alter table public.voting_categories enable row level security;
alter table public.voting_categories force row level security;

create policy voting_categories_select_public
  on public.voting_categories for select
  to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1 from public.festivals f
      where f.id = festival_id and f.status <> 'draft'
    )
  );

create policy voting_categories_select_admin
  on public.voting_categories for select
  to authenticated
  using ((select private.is_admin()));

create policy voting_categories_write_admin
  on public.voting_categories for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------

alter table public.restaurants enable row level security;
alter table public.restaurants force row level security;

create policy restaurants_select_public
  on public.restaurants for select
  to anon, authenticated
  using (
    status = 'active'
    and deleted_at is null
    and exists (
      select 1 from public.festivals f
      where f.id = festival_id and f.status <> 'draft'
    )
  );

create policy restaurants_select_owner
  on public.restaurants for select
  to authenticated
  using (owner_user_id = (select auth.uid()));

create policy restaurants_select_admin
  on public.restaurants for select
  to authenticated
  using ((select private.is_admin()));

create policy restaurants_update_owner
  on public.restaurants for update
  to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

create policy restaurants_write_admin
  on public.restaurants for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- dishes
-- ---------------------------------------------------------------

alter table public.dishes enable row level security;
alter table public.dishes force row level security;

create policy dishes_select_public
  on public.dishes for select
  to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1 from public.restaurants r
      join public.festivals f on f.id = r.festival_id
      where r.id = restaurant_id
        and r.status = 'active'
        and r.deleted_at is null
        and f.status <> 'draft'
    )
  );

create policy dishes_select_owner
  on public.dishes for select
  to authenticated
  using ((select private.owns_restaurant(restaurant_id)));

create policy dishes_select_admin
  on public.dishes for select
  to authenticated
  using ((select private.is_admin()));

create policy dishes_write_owner
  on public.dishes for all
  to authenticated
  using ((select private.owns_restaurant(restaurant_id)))
  with check ((select private.owns_restaurant(restaurant_id)));

create policy dishes_write_admin
  on public.dishes for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- restaurant_gallery
-- ---------------------------------------------------------------

alter table public.restaurant_gallery enable row level security;
alter table public.restaurant_gallery force row level security;

create policy restaurant_gallery_select_public
  on public.restaurant_gallery for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.restaurants r
      join public.festivals f on f.id = r.festival_id
      where r.id = restaurant_id
        and r.status = 'active'
        and r.deleted_at is null
        and f.status <> 'draft'
    )
  );

create policy restaurant_gallery_select_owner
  on public.restaurant_gallery for select
  to authenticated
  using ((select private.owns_restaurant(restaurant_id)));

create policy restaurant_gallery_select_admin
  on public.restaurant_gallery for select
  to authenticated
  using ((select private.is_admin()));

create policy restaurant_gallery_write_owner
  on public.restaurant_gallery for all
  to authenticated
  using ((select private.owns_restaurant(restaurant_id)))
  with check ((select private.owns_restaurant(restaurant_id)));

create policy restaurant_gallery_write_admin
  on public.restaurant_gallery for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- sponsors
-- ---------------------------------------------------------------

alter table public.sponsors enable row level security;
alter table public.sponsors force row level security;

create policy sponsors_select_public
  on public.sponsors for select
  to anon, authenticated
  using (status = 'active');

create policy sponsors_select_admin
  on public.sponsors for select
  to authenticated
  using ((select private.is_admin()));

create policy sponsors_write_admin
  on public.sponsors for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- landing_sections
-- ---------------------------------------------------------------

alter table public.landing_sections enable row level security;
alter table public.landing_sections force row level security;

create policy landing_sections_select_public
  on public.landing_sections for select
  to anon, authenticated
  using (is_active);

create policy landing_sections_select_admin
  on public.landing_sections for select
  to authenticated
  using ((select private.is_admin()));

create policy landing_sections_write_admin
  on public.landing_sections for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- system_settings — sem policy pública; exposição controlada via
-- função get_public_settings() (migration de funções).
-- ---------------------------------------------------------------

alter table public.system_settings enable row level security;
alter table public.system_settings force row level security;

create policy system_settings_select_admin
  on public.system_settings for select
  to authenticated
  using ((select private.is_admin()));

create policy system_settings_write_admin
  on public.system_settings for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- votes — nenhuma policy de INSERT/UPDATE/DELETE. Toda escrita
-- acontece via register_vote()/moderate_vote() (SECURITY DEFINER).
-- ---------------------------------------------------------------

alter table public.votes enable row level security;
alter table public.votes force row level security;

create policy votes_select_admin
  on public.votes for select
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------
-- analytics_events — leitura para admin e para o dono do restaurante;
-- escrita apenas via service role (rota de ingestão bypassa RLS).
-- ---------------------------------------------------------------

alter table public.analytics_events enable row level security;
alter table public.analytics_events force row level security;

create policy analytics_events_select_owner
  on public.analytics_events for select
  to authenticated
  using (
    restaurant_id is not null
    and (select private.owns_restaurant(restaurant_id))
  );

create policy analytics_events_select_admin
  on public.analytics_events for select
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------
-- restaurant_change_requests
-- ---------------------------------------------------------------

alter table public.restaurant_change_requests enable row level security;
alter table public.restaurant_change_requests force row level security;

create policy change_requests_select_owner
  on public.restaurant_change_requests for select
  to authenticated
  using (
    requested_by = (select auth.uid())
    or (select private.owns_restaurant(restaurant_id))
  );

create policy change_requests_select_admin
  on public.restaurant_change_requests for select
  to authenticated
  using ((select private.is_admin()));

create policy change_requests_insert_owner
  on public.restaurant_change_requests for insert
  to authenticated
  with check (
    requested_by = (select auth.uid())
    and (select private.owns_restaurant(restaurant_id))
  );

create policy change_requests_update_admin
  on public.restaurant_change_requests for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------
-- audit_logs — somente leitura para administradores; escrita apenas
-- via função private.write_audit_log() (SECURITY DEFINER).
-- ---------------------------------------------------------------

alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

create policy audit_logs_select_admin
  on public.audit_logs for select
  to authenticated
  using ((select private.is_admin()));
