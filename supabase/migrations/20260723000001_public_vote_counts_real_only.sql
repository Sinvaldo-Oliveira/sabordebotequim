-- Corrige get_public_vote_counts para contar apenas votos reais confirmados
-- via WhatsApp (mesma regra usada em get_whatsapp_voting_metrics.votes_valid),
-- excluindo votos de demonstração/seed inseridos sem whatsapp_hash.

create or replace function public.get_public_vote_counts(p_festival_id uuid)
returns table (restaurant_id uuid, votes_count bigint)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_visible boolean;
begin
  if (select private.is_admin()) then
    v_visible := true;
  else
    select coalesce((setting_value ->> 'enabled')::boolean, true)
      into v_visible
    from public.system_settings
    where festival_id = p_festival_id
      and setting_key = 'public_show_vote_counts';

    v_visible := coalesce(v_visible, true);
  end if;

  if not v_visible then
    return query
      select r.id, 0::bigint
      from public.restaurants r
      where r.festival_id = p_festival_id;
    return;
  end if;

  return query
    select r.id, count(v.id)::bigint
    from public.restaurants r
    left join public.votes v
      on v.restaurant_id = r.id
      and v.status = 'valid'
      and v.whatsapp_hash is not null
    where r.festival_id = p_festival_id
    group by r.id;
end;
$$;
