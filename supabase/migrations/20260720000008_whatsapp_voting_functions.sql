-- =============================================================
-- Sabor de Botequim — Funções do fluxo de votação por WhatsApp
--
-- Todas SECURITY DEFINER, search_path = '', chamadas apenas pelo
-- servidor (API Routes com service role). O código OTP em texto
-- puro nunca é recebido: o Node envia sempre o hash.
-- =============================================================

-- ---------------------------------------------------------------
-- request_vote_otp — valida elegibilidade e registra o pedido de
-- código. Reutiliza a verificação viva do mesmo número (invalidando
-- o código anterior). Aplica rate limiting (intervalo mínimo entre
-- reenvios e teto por janela de 30 min).
-- ---------------------------------------------------------------

create or replace function public.request_vote_otp(
  p_festival_id uuid,
  p_category_id uuid,
  p_restaurant_id uuid,
  p_dish_id uuid,
  p_voter_name text,
  p_whatsapp_e164 text,
  p_whatsapp_salt text,
  p_encryption_key text,
  p_otp_hash text,
  p_otp_ttl_seconds integer,
  p_resend_min_seconds integer,
  p_max_sends_per_window integer,
  p_consent_regulation boolean,
  p_consent_privacy boolean,
  p_terms_version text,
  p_ip_hash text default null,
  p_user_agent text default null
) returns table (
  verification_id bigint,
  whatsapp_last_digits text,
  resend_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_festival public.festivals;
  v_category public.voting_categories;
  v_restaurant public.restaurants;
  v_hash text;
  v_encrypted text;
  v_last4 text;
  v_existing public.vote_verifications;
  v_id bigint;
  v_resend integer;
begin
  if p_consent_regulation is not true or p_consent_privacy is not true then
    raise exception 'CONSENT_REQUIRED';
  end if;

  select * into v_festival from public.festivals where id = p_festival_id;
  if not found or v_festival.status <> 'active' then
    raise exception 'VOTING_NOT_ACTIVE';
  end if;
  if v_festival.voting_start_at is not null and now() < v_festival.voting_start_at then
    raise exception 'VOTING_NOT_STARTED';
  end if;
  if v_festival.voting_end_at is not null and now() > v_festival.voting_end_at then
    raise exception 'VOTING_CLOSED';
  end if;

  select * into v_category from public.voting_categories
    where id = p_category_id and festival_id = p_festival_id;
  if not found or v_category.status <> 'active' then
    raise exception 'CATEGORY_NOT_ACTIVE';
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

  v_hash := encode(extensions.digest(p_whatsapp_e164 || p_whatsapp_salt, 'sha256'), 'hex');
  v_encrypted := extensions.pgp_sym_encrypt(p_whatsapp_e164, p_encryption_key);
  v_last4 := right(p_whatsapp_e164, 4);

  -- Serializa pedidos concorrentes do mesmo número.
  perform pg_advisory_xact_lock(hashtext(v_hash));

  -- Já existe voto válido deste número neste festival? (regra 1 voto/edição)
  if exists (
    select 1 from public.votes
    where festival_id = p_festival_id
      and whatsapp_hash = v_hash
      and status = 'valid'
  ) then
    raise exception 'VOTE_DUPLICATE';
  end if;

  select * into v_existing from public.vote_verifications
    where festival_id = p_festival_id
      and whatsapp_hash = v_hash
      and status in ('pending', 'verified')
    limit 1;

  if found then
    -- Reinicia a janela de rate limit se o último envio foi há mais de 30 min.
    v_resend := case
      when v_existing.last_sent_at < now() - interval '30 minutes' then 1
      else v_existing.resend_count + 1
    end;

    if v_existing.last_sent_at > now() - make_interval(secs => p_resend_min_seconds) then
      raise exception 'RESEND_TOO_SOON';
    end if;
    if v_resend > p_max_sends_per_window then
      raise exception 'TOO_MANY_REQUESTS';
    end if;

    update public.vote_verifications set
      restaurant_id = p_restaurant_id,
      category_id = p_category_id,
      dish_id = p_dish_id,
      voter_name = p_voter_name,
      whatsapp_encrypted = v_encrypted,
      whatsapp_last_digits = v_last4,
      otp_hash = p_otp_hash,
      otp_expires_at = now() + make_interval(secs => p_otp_ttl_seconds),
      otp_attempts = 0,
      status = 'pending',
      resend_count = v_resend,
      last_sent_at = now(),
      consent_regulation = p_consent_regulation,
      consent_privacy = p_consent_privacy,
      terms_version = p_terms_version,
      ip_hash = p_ip_hash,
      user_agent = p_user_agent
    where id = v_existing.id;

    v_id := v_existing.id;
  else
    insert into public.vote_verifications (
      festival_id, restaurant_id, category_id, dish_id, voter_name,
      whatsapp_hash, whatsapp_encrypted, whatsapp_last_digits,
      otp_hash, otp_expires_at, status, resend_count, last_sent_at,
      consent_regulation, consent_privacy, terms_version, ip_hash, user_agent
    ) values (
      p_festival_id, p_restaurant_id, p_category_id, p_dish_id, p_voter_name,
      v_hash, v_encrypted, v_last4,
      p_otp_hash, now() + make_interval(secs => p_otp_ttl_seconds), 'pending', 1, now(),
      p_consent_regulation, p_consent_privacy, p_terms_version, p_ip_hash, p_user_agent
    )
    returning id into v_id;
    v_resend := 1;
  end if;

  return query select v_id, v_last4, v_resend;
end;
$$;

revoke execute on function public.request_vote_otp(
  uuid, uuid, uuid, uuid, text, text, text, text, text, integer, integer, integer,
  boolean, boolean, text, text, text
) from public, anon;
grant execute on function public.request_vote_otp(
  uuid, uuid, uuid, uuid, text, text, text, text, text, integer, integer, integer,
  boolean, boolean, text, text, text
) to authenticated, service_role;

-- ---------------------------------------------------------------
-- verify_vote_otp — compara o hash informado, e em caso de acerto
-- registra o voto de forma atômica (o índice único impede corrida),
-- consome a verificação e gera o protocolo.
-- ---------------------------------------------------------------

create or replace function public.verify_vote_otp(
  p_verification_id bigint,
  p_otp_hash_attempt text
) returns table (
  protocol text,
  restaurant_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.vote_verifications;
  v_festival public.festivals;
  v_protocol text;
  v_vote public.votes;
begin
  select * into v from public.vote_verifications where id = p_verification_id for update;
  if not found then
    raise exception 'VERIFICATION_NOT_FOUND';
  end if;

  if v.status = 'used' then
    raise exception 'ALREADY_USED';
  end if;
  if v.status in ('blocked', 'cancelled') then
    raise exception 'TOO_MANY_ATTEMPTS';
  end if;
  if v.otp_expires_at < now() then
    update public.vote_verifications set status = 'expired' where id = v.id;
    raise exception 'OTP_EXPIRED';
  end if;
  if v.otp_attempts >= v.otp_max_attempts then
    update public.vote_verifications set status = 'blocked' where id = v.id;
    raise exception 'TOO_MANY_ATTEMPTS';
  end if;

  if p_otp_hash_attempt is distinct from v.otp_hash then
    update public.vote_verifications
      set otp_attempts = otp_attempts + 1,
          status = case when otp_attempts + 1 >= otp_max_attempts then 'blocked' else status end
      where id = v.id;
    raise exception 'OTP_INVALID';
  end if;

  -- Código correto — revalida disponibilidade antes de registrar.
  select * into v_festival from public.festivals where id = v.festival_id;
  if not found or v_festival.status <> 'active' then
    raise exception 'VOTING_NOT_ACTIVE';
  end if;
  if v_festival.voting_end_at is not null and now() > v_festival.voting_end_at then
    raise exception 'VOTING_CLOSED';
  end if;
  if not exists (
    select 1 from public.restaurants
    where id = v.restaurant_id and status = 'active' and deleted_at is null
  ) then
    raise exception 'RESTAURANT_NOT_AVAILABLE';
  end if;
  if exists (
    select 1 from public.votes
    where festival_id = v.festival_id and whatsapp_hash = v.whatsapp_hash and status = 'valid'
  ) then
    update public.vote_verifications set status = 'used', used_at = now() where id = v.id;
    raise exception 'VOTE_DUPLICATE';
  end if;

  v_protocol := 'SB-' || to_char(now(), 'YYYY') || '-' ||
    upper(substr(encode(extensions.gen_random_bytes(5), 'hex'), 1, 6));

  begin
    insert into public.votes (
      festival_id, restaurant_id, dish_id, category_id, verification_id, voter_name,
      whatsapp_hash, whatsapp_encrypted, whatsapp_last_digits, protocol, status,
      consent_privacy, consent_regulation, terms_version, ip_hash, user_agent
    ) values (
      v.festival_id, v.restaurant_id, v.dish_id, v.category_id, v.id, v.voter_name,
      v.whatsapp_hash, v.whatsapp_encrypted, v.whatsapp_last_digits, v_protocol, 'valid',
      v.consent_privacy, v.consent_regulation, v.terms_version, v.ip_hash, v.user_agent
    )
    returning * into v_vote;
  exception when unique_violation then
    update public.vote_verifications set status = 'used', used_at = now() where id = v.id;
    raise exception 'VOTE_DUPLICATE';
  end;

  update public.vote_verifications
    set status = 'used', verified_at = now(), used_at = now()
    where id = v.id;

  return query select v_vote.protocol, v_vote.restaurant_id, v_vote.created_at;
end;
$$;

revoke execute on function public.verify_vote_otp(bigint, text) from public, anon;
grant execute on function public.verify_vote_otp(bigint, text) to authenticated, service_role;

-- ---------------------------------------------------------------
-- get_whatsapp_voting_metrics — indicadores de OTP/votos para o admin.
-- ---------------------------------------------------------------

create or replace function public.get_whatsapp_voting_metrics(p_festival_id uuid)
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
    'codes_requested', (select count(*) from public.vote_verifications where festival_id = p_festival_id),
    'pending', (select count(*) from public.vote_verifications where festival_id = p_festival_id and status = 'pending'),
    'used', (select count(*) from public.vote_verifications where festival_id = p_festival_id and status = 'used'),
    'expired', (select count(*) from public.vote_verifications where festival_id = p_festival_id and status = 'expired'),
    'blocked', (select count(*) from public.vote_verifications where festival_id = p_festival_id and status = 'blocked'),
    'votes_valid', (select count(*) from public.votes where festival_id = p_festival_id and status = 'valid' and whatsapp_hash is not null)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.get_whatsapp_voting_metrics(uuid) from public, anon;
grant execute on function public.get_whatsapp_voting_metrics(uuid) to authenticated, service_role;
