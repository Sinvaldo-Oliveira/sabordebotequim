-- =============================================================
-- Sabor de Botequim — Helpers de papel (role)
--
-- Usados nas policies de RLS. SECURITY DEFINER para poder ler
-- profiles/restaurants independente da RLS das próprias tabelas;
-- sempre resolvem o papel do usuário chamador
-- ((select auth.uid())), nunca recebem um user_id como parâmetro.
-- Precisam rodar depois de core_tables (profiles, restaurants).
-- =============================================================

create or replace function private.current_role()
returns public.user_role
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

revoke execute on function private.current_role() from public, anon, authenticated;
grant execute on function private.current_role() to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select role in ('superadmin','admin','moderator','analyst')
       from public.profiles where id = (select auth.uid())),
    false
  );
$$;

revoke execute on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.is_superadmin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (select role = 'superadmin' from public.profiles where id = (select auth.uid())),
    false
  );
$$;

revoke execute on function private.is_superadmin() from public, anon, authenticated;
grant execute on function private.is_superadmin() to authenticated;

create or replace function private.owns_restaurant(p_restaurant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.restaurants
    where id = p_restaurant_id
      and owner_user_id = (select auth.uid())
  );
$$;

revoke execute on function private.owns_restaurant(uuid) from public, anon, authenticated;
grant execute on function private.owns_restaurant(uuid) to authenticated;
