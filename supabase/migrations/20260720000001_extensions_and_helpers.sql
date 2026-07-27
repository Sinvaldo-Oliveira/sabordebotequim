-- =============================================================
-- Sabor de Botequim — Extensões, enums e funções auxiliares
-- =============================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- Schema privado para funções internas (não expostas via PostgREST)
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------

create type public.user_role as enum (
  'superadmin',
  'admin',
  'moderator',
  'analyst',
  'restaurant'
);

create type public.entity_status as enum (
  'active',
  'inactive',
  'pending',
  'suspended'
);

create type public.festival_status as enum (
  'draft',
  'scheduled',
  'active',
  'paused',
  'closed',
  'tallying',
  'published'
);

create type public.voting_rule as enum (
  'one_per_festival',
  'one_per_category',
  'one_per_restaurant',
  'one_per_period',
  'custom'
);

create type public.vote_status as enum (
  'valid',
  'under_review',
  'suspicious',
  'invalidated',
  'cancelled'
);

create type public.change_request_status as enum (
  'pending',
  'approved',
  'rejected'
);

-- ---------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
