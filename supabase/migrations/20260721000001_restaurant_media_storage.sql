-- =============================================================
-- Sabor de Botequim — Storage para imagens de restaurantes
--
-- Bucket público (logo, banner, galeria, foto do prato) — a leitura
-- é pública (bucket public=true, sem custo de RLS), a escrita é
-- restrita ao dono do restaurante (via caminho restaurants/<id>/...)
-- ou administração.
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-media',
  'restaurant-media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- storage.foldername(name) retorna os segmentos de pasta do objeto;
-- para 'restaurants/<restaurant_id>/logo.png' o índice [2] é o id.
create policy restaurant_media_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'restaurant-media'
    and (storage.foldername(name))[1] = 'restaurants'
    and (
      (select private.is_admin())
      or (select private.owns_restaurant(((storage.foldername(name))[2])::uuid))
    )
  );

create policy restaurant_media_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'restaurant-media'
    and (storage.foldername(name))[1] = 'restaurants'
    and (
      (select private.is_admin())
      or (select private.owns_restaurant(((storage.foldername(name))[2])::uuid))
    )
  );

create policy restaurant_media_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'restaurant-media'
    and (storage.foldername(name))[1] = 'restaurants'
    and (
      (select private.is_admin())
      or (select private.owns_restaurant(((storage.foldername(name))[2])::uuid))
    )
  );
