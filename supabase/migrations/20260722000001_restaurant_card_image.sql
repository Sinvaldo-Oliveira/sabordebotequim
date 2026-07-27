-- =============================================================
-- Sabor de Botequim — Imagem própria para o card de restaurante
--
-- Até aqui, restaurants.banner_url alimentava tanto o card da home
-- quanto o topo da página pública do restaurante. Agora são duas
-- imagens independentes:
--   logo_url       — logo (já existia)
--   card_image_url — banner exibido no card da listagem (novo)
--   banner_url     — banner do topo da página pública (já existia)
-- =============================================================

alter table public.restaurants
  add column if not exists card_image_url text;
