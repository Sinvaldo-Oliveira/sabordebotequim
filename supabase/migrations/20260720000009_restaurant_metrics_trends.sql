-- =============================================================
-- Sabor de Botequim — Métricas com tendência para o painel do
-- restaurante (visitas/cliques/votos desta semana vs. semana
-- anterior, e votos por dia para o gráfico).
--
-- get_restaurant_metrics() é redefinida (mesma assinatura, mesmo
-- contrato de acesso) apenas adicionando novas chaves ao jsonb —
-- não remove nenhuma chave existente.
-- =============================================================

create or replace function public.get_restaurant_metrics(p_restaurant_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_result jsonb;
  v_daily jsonb;
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
    'map_clicks', count(*) filter (where event_name = 'map_click'),
    'views_this_week', count(*) filter (
      where event_name = 'restaurant_profile_view' and created_at >= now() - interval '7 days'
    ),
    'views_previous_week', count(*) filter (
      where event_name = 'restaurant_profile_view'
        and created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'
    ),
    'clicks_this_week', count(*) filter (
      where event_name = 'vote_button_click' and created_at >= now() - interval '7 days'
    ),
    'clicks_previous_week', count(*) filter (
      where event_name = 'vote_button_click'
        and created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'
    )
  ) into v_result
  from public.analytics_events
  where restaurant_id = p_restaurant_id;

  v_result := v_result || jsonb_build_object(
    'total_votes', (
      select count(*) from public.votes
      where restaurant_id = p_restaurant_id and status = 'valid'
    ),
    'votes_this_week', (
      select count(*) from public.votes
      where restaurant_id = p_restaurant_id and status = 'valid'
        and created_at >= now() - interval '7 days'
    ),
    'votes_previous_week', (
      select count(*) from public.votes
      where restaurant_id = p_restaurant_id and status = 'valid'
        and created_at >= now() - interval '14 days' and created_at < now() - interval '7 days'
    )
  );

  select coalesce(jsonb_agg(jsonb_build_object('date', d.day, 'votes', coalesce(v.c, 0)) order by d.day), '[]'::jsonb)
    into v_daily
  from generate_series(
    date_trunc('day', now() - interval '13 days'),
    date_trunc('day', now()),
    interval '1 day'
  ) as d(day)
  left join (
    select date_trunc('day', created_at) as day, count(*) as c
    from public.votes
    where restaurant_id = p_restaurant_id and status = 'valid'
      and created_at >= now() - interval '14 days'
    group by 1
  ) v on v.day = d.day;

  v_result := v_result || jsonb_build_object('daily_votes', v_daily);

  return v_result;
end;
$$;
