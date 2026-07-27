-- =============================================================
-- Sabor de Botequim — Funções RPC
--
-- Todas as funções SECURITY DEFINER têm search_path = '' e
-- qualificam explicitamente schema.tabela para evitar sequestro
-- de search_path. A verificação de identidade/permissão do
-- chamador acontece SEMPRE dentro da função, nunca é recebida
-- como parâmetro confiável.
-- =============================================================

-- ---------------------------------------------------------------
-- Auditoria — função interna usada por moderate_vote e outras.
-- ---------------------------------------------------------------

create or replace function private.write_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_old_values jsonb,
  p_new_values jsonb,
  p_ip_hash text default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_hash)
  values ((select auth.uid()), p_action, p_entity_type, p_entity_id, p_old_values, p_new_values, p_ip_hash);
end;
$$;

revoke execute on function private.write_audit_log(text, text, text, jsonb, jsonb, text) from public, anon, authenticated;

-- ---------------------------------------------------------------
-- generate_protocol — código público de confirmação do voto.
-- ---------------------------------------------------------------

create or replace function private.generate_protocol()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate text;
  v_attempts int := 0;
begin
  loop
    v_candidate := 'SBQ-' || to_char(now(), 'YYYY') || '-' ||
      upper(substr(encode(extensions.gen_random_bytes(5), 'hex'), 1, 8));

    exit when not exists (select 1 from public.votes where protocol = v_candidate);

    v_attempts := v_attempts + 1;
    if v_attempts > 10 then
      raise exception 'PROTOCOL_GENERATION_FAILED';
    end if;
  end loop;

  return v_candidate;
end;
$$;

revoke execute on function private.generate_protocol() from public, anon, authenticated;

-- ---------------------------------------------------------------
-- register_vote — única via de inserção em votes.
--
-- Recebe o CPF em texto puro (chamada servidor-a-servidor, nunca do
-- navegador) junto com o salt/chave vindos das variáveis de ambiente
-- da aplicação (CPF_HASH_SALT / CPF_ENCRYPTION_KEY), calcula hash e
-- criptografia dentro do banco via pgcrypto, e só então valida as
-- regras de negócio. Um advisory lock por CPF serializa tentativas
-- concorrentes do mesmo CPF antes de checar duplicidade.
-- ---------------------------------------------------------------

create or replace function public.register_vote(
  p_festival_id uuid,
  p_category_id uuid,
  p_restaurant_id uuid,
  p_dish_id uuid,
  p_voter_name text,
  p_voter_cpf text,
  p_cpf_hash_salt text,
  p_cpf_encryption_key text,
  p_consent_privacy boolean,
  p_consent_regulation boolean,
  p_terms_version text,
  p_ip_hash text default null,
  p_user_agent text default null,
  p_risk_score integer default 0,
  p_risk_reasons jsonb default '[]'::jsonb
) returns table (
  protocol text,
  status public.vote_status,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_festival public.festivals;
  v_category public.voting_categories;
  v_restaurant public.restaurants;
  v_cpf_hash text;
  v_cpf_encrypted text;
  v_cpf_last_digits text;
  v_duplicate_count int;
  v_status public.vote_status;
  v_protocol text;
  v_row public.votes;
begin
  if p_consent_privacy is not true or p_consent_regulation is not true then
    raise exception 'CONSENT_REQUIRED';
  end if;

  select * into v_festival from public.festivals where id = p_festival_id;
  if not found or v_festival.status not in ('active', 'paused') then
    raise exception 'VOTING_NOT_ACTIVE';
  end if;
  if v_festival.voting_start_at is not null and now() < v_festival.voting_start_at then
    raise exception 'VOTING_NOT_STARTED';
  end if;
  if v_festival.voting_end_at is not null and now() > v_festival.voting_end_at then
    raise exception 'VOTING_CLOSED';
  end if;
  if v_festival.status = 'paused' then
    raise exception 'VOTING_PAUSED';
  end if;

  select * into v_category from public.voting_categories
    where id = p_category_id and festival_id = p_festival_id;
  if not found or v_category.status <> 'active' then
    raise exception 'CATEGORY_NOT_ACTIVE';
  end if;
  if v_category.voting_start_at is not null and now() < v_category.voting_start_at then
    raise exception 'VOTING_NOT_STARTED';
  end if;
  if v_category.voting_end_at is not null and now() > v_category.voting_end_at then
    raise exception 'VOTING_CLOSED';
  end if;

  select * into v_restaurant from public.restaurants
    where id = p_restaurant_id and festival_id = p_festival_id;
  if not found or v_restaurant.status <> 'active' or v_restaurant.deleted_at is not null then
    raise exception 'RESTAURANT_NOT_AVAILABLE';
  end if;

  if p_dish_id is not null and not exists (
    select 1 from public.dishes where id = p_dish_id and restaurant_id = p_restaurant_id
  ) then
    raise exception 'DISH_NOT_FOUND';
  end if;

  -- Deriva hash/criptografia/últimos dígitos dentro do banco.
  v_cpf_hash := encode(extensions.digest(p_voter_cpf || p_cpf_hash_salt, 'sha256'), 'hex');
  v_cpf_encrypted := extensions.pgp_sym_encrypt(p_voter_cpf, p_cpf_encryption_key);
  v_cpf_last_digits := right(p_voter_cpf, 2);

  -- Serializa tentativas concorrentes do mesmo CPF (liberado ao final da transação).
  perform pg_advisory_xact_lock(hashtext(v_cpf_hash));

  -- Verifica duplicidade conforme a regra configurada na categoria.
  -- Colunas sempre qualificadas com o alias "v": o parâmetro de saída
  -- "status" da função tem o mesmo nome da coluna votes.status, e um
  -- "status" não qualificado seria ambíguo dentro do PL/pgSQL.
  case v_category.voting_rule
    when 'one_per_festival' then
      select count(*) into v_duplicate_count from public.votes v
        where v.festival_id = p_festival_id
          and v.voter_cpf_hash = v_cpf_hash
          and v.status in ('valid', 'under_review');
    when 'one_per_restaurant' then
      select count(*) into v_duplicate_count from public.votes v
        where v.festival_id = p_festival_id
          and v.restaurant_id = p_restaurant_id
          and v.voter_cpf_hash = v_cpf_hash
          and v.status in ('valid', 'under_review');
    when 'one_per_period' then
      select count(*) into v_duplicate_count from public.votes v
        where v.festival_id = p_festival_id
          and v.category_id = p_category_id
          and v.voter_cpf_hash = v_cpf_hash
          and v.status in ('valid', 'under_review')
          and v.created_at > now() - make_interval(hours => coalesce(v_category.period_hours, 24));
    else
      -- one_per_category e custom caem no backstop padrão (por categoria)
      select count(*) into v_duplicate_count from public.votes v
        where v.festival_id = p_festival_id
          and v.category_id = p_category_id
          and v.voter_cpf_hash = v_cpf_hash
          and v.status in ('valid', 'under_review');
  end case;

  if v_duplicate_count > 0 then
    raise exception 'VOTE_DUPLICATE';
  end if;

  v_status := case when p_risk_score >= 70 then 'under_review' else 'valid' end;
  v_protocol := private.generate_protocol();

  insert into public.votes (
    festival_id, restaurant_id, dish_id, category_id, voter_name,
    voter_cpf_hash, voter_cpf_encrypted, voter_cpf_last_digits, protocol,
    status, consent_privacy, consent_regulation, terms_version,
    ip_hash, user_agent, risk_score, risk_reasons
  ) values (
    p_festival_id, p_restaurant_id, p_dish_id, p_category_id, p_voter_name,
    v_cpf_hash, v_cpf_encrypted, v_cpf_last_digits, v_protocol,
    v_status, p_consent_privacy, p_consent_regulation, p_terms_version,
    p_ip_hash, p_user_agent, p_risk_score, p_risk_reasons
  )
  returning * into v_row;

  return query select v_row.protocol, v_row.status, v_row.created_at;
end;
$$;

revoke execute on function public.register_vote(
  uuid, uuid, uuid, uuid, text, text, text, text, boolean, boolean, text, text, text, integer, jsonb
) from public;
grant execute on function public.register_vote(
  uuid, uuid, uuid, uuid, text, text, text, text, boolean, boolean, text, text, text, integer, jsonb
) to anon, authenticated;

-- ---------------------------------------------------------------
-- moderate_vote — altera o status de um voto com trilha de auditoria.
-- ---------------------------------------------------------------

create or replace function public.moderate_vote(
  p_vote_id bigint,
  p_new_status public.vote_status,
  p_reason text default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.votes;
begin
  if not (select private.is_admin()) then
    raise exception 'FORBIDDEN';
  end if;

  select * into v_old from public.votes where id = p_vote_id;
  if not found then
    raise exception 'VOTE_NOT_FOUND';
  end if;

  update public.votes
    set status = p_new_status,
        moderation_notes = coalesce(p_reason, moderation_notes),
        invalidated_at = case when p_new_status in ('invalidated', 'cancelled') then now() else null end,
        invalidated_by = case when p_new_status in ('invalidated', 'cancelled') then (select auth.uid()) else null end,
        invalidation_reason = case when p_new_status in ('invalidated', 'cancelled') then p_reason else null end
    where id = p_vote_id;

  perform private.write_audit_log(
    'moderate_vote',
    'votes',
    p_vote_id::text,
    jsonb_build_object('status', v_old.status),
    jsonb_build_object('status', p_new_status, 'reason', p_reason)
  );
end;
$$;

revoke execute on function public.moderate_vote(bigint, public.vote_status, text) from public, anon;
grant execute on function public.moderate_vote(bigint, public.vote_status, text) to authenticated;

-- ---------------------------------------------------------------
-- update_own_profile — permite que o usuário edite nome/avatar sem
-- poder alterar seu próprio papel ou status.
-- ---------------------------------------------------------------

create or replace function public.update_own_profile(
  p_full_name text default null,
  p_avatar_url text default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
    set full_name = coalesce(p_full_name, full_name),
        avatar_url = coalesce(p_avatar_url, avatar_url)
    where id = (select auth.uid());
end;
$$;

revoke execute on function public.update_own_profile(text, text) from public, anon;
grant execute on function public.update_own_profile(text, text) to authenticated;

-- ---------------------------------------------------------------
-- get_public_settings — expõe apenas configurações com prefixo
-- "public_" (tema, textos, integrações não sensíveis).
-- ---------------------------------------------------------------

create or replace function public.get_public_settings(p_festival_id uuid)
returns jsonb
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(setting_key, setting_value), '{}'::jsonb)
  from public.system_settings
  where festival_id = p_festival_id
    and setting_key like 'public_%';
$$;

revoke execute on function public.get_public_settings(uuid) from public;
grant execute on function public.get_public_settings(uuid) to anon, authenticated;

-- ---------------------------------------------------------------
-- get_restaurant_metrics — métricas agregadas, sem dados pessoais
-- de votantes. Acesso: dono do restaurante ou administração.
-- ---------------------------------------------------------------

create or replace function public.get_restaurant_metrics(p_restaurant_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not (
    (select private.owns_restaurant(p_restaurant_id))
    or (select private.is_admin())
  ) then
    raise exception 'FORBIDDEN';
  end if;

  select jsonb_build_object(
    'total_views', count(*) filter (where event_name = 'restaurant_profile_view'),
    'total_card_clicks', count(*) filter (where event_name = 'restaurant_card_click'),
    'vote_button_clicks', count(*) filter (where event_name = 'vote_button_click'),
    'vote_form_starts', count(*) filter (where event_name = 'vote_form_start'),
    'whatsapp_clicks', count(*) filter (where event_name = 'whatsapp_click'),
    'instagram_clicks', count(*) filter (where event_name = 'instagram_click'),
    'map_clicks', count(*) filter (where event_name = 'map_click')
  ) into v_result
  from public.analytics_events
  where restaurant_id = p_restaurant_id;

  v_result := v_result || jsonb_build_object(
    'total_votes', (
      select count(*) from public.votes
      where restaurant_id = p_restaurant_id and status = 'valid'
    )
  );

  return v_result;
end;
$$;

revoke execute on function public.get_restaurant_metrics(uuid) from public, anon;
grant execute on function public.get_restaurant_metrics(uuid) to authenticated;

-- ---------------------------------------------------------------
-- get_admin_dashboard_stats — indicadores gerais da visão geral
-- administrativa.
-- ---------------------------------------------------------------

create or replace function public.get_admin_dashboard_stats(p_festival_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'FORBIDDEN';
  end if;

  select jsonb_build_object(
    'restaurants_total', (select count(*) from public.restaurants where festival_id = p_festival_id and deleted_at is null),
    'restaurants_active', (select count(*) from public.restaurants where festival_id = p_festival_id and status = 'active' and deleted_at is null),
    'restaurants_pending', (select count(*) from public.restaurants where festival_id = p_festival_id and status = 'pending' and deleted_at is null),
    'votes_valid', (select count(*) from public.votes where festival_id = p_festival_id and status = 'valid'),
    'votes_under_review', (select count(*) from public.votes where festival_id = p_festival_id and status = 'under_review'),
    'votes_invalidated', (select count(*) from public.votes where festival_id = p_festival_id and status in ('invalidated', 'cancelled')),
    'page_views', (select count(*) from public.analytics_events where festival_id = p_festival_id and event_name = 'landing_view'),
    'vote_button_clicks', (select count(*) from public.analytics_events where festival_id = p_festival_id and event_name = 'vote_button_click')
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.get_admin_dashboard_stats(uuid) from public, anon;
grant execute on function public.get_admin_dashboard_stats(uuid) to authenticated;

-- ---------------------------------------------------------------
-- anonymize_festival_votes — LGPD: remove dados pessoais preservando
-- as contagens estatísticas, após o encerramento do festival.
-- ---------------------------------------------------------------

create or replace function public.anonymize_festival_votes(p_festival_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_superadmin()) then
    raise exception 'FORBIDDEN';
  end if;

  update public.votes
    set voter_name = '[anonimizado]',
        voter_cpf_encrypted = '',
        voter_cpf_hash = encode(extensions.digest(id::text, 'sha256'), 'hex'),
        ip_hash = null,
        user_agent = null
    where festival_id = p_festival_id;

  perform private.write_audit_log(
    'anonymize_festival_votes',
    'festivals',
    p_festival_id::text,
    null,
    jsonb_build_object('anonymized_at', now())
  );
end;
$$;

revoke execute on function public.anonymize_festival_votes(uuid) from public, anon;
grant execute on function public.anonymize_festival_votes(uuid) to authenticated;
