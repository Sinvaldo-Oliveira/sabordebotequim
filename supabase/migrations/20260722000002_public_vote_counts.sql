-- =============================================================
-- Sabor de Botequim — Contagem pública de votos por restaurante
--
-- Retorna apenas agregados (restaurant_id + total), nunca linhas de
-- votes nem dados de votantes. Para chamadas anônimas, respeita o
-- interruptor "public_show_vote_counts" em system_settings — quando
-- desativado, os totais voltam zerados mesmo que a função seja
-- chamada diretamente (a decisão de exibir ou não fica no banco,
-- não só na interface). Administradores sempre veem os valores reais.
-- =============================================================

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
      on v.restaurant_id = r.id and v.status = 'valid'
    where r.festival_id = p_festival_id
    group by r.id;
end;
$$;

revoke execute on function public.get_public_vote_counts(uuid) from public;
grant execute on function public.get_public_vote_counts(uuid) to anon, authenticated;
