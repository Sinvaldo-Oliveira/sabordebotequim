-- =============================================================
-- Sabor de Botequim — Dados demonstrativos
--
-- ATENÇÃO: dados fictícios para apresentação do sistema. Nenhum
-- CPF real é usado — os valores abaixo são sequências inventadas.
--
-- Rodar DEPOIS das migrations. As contas de acesso (1 admin + 2
-- restaurantes) são criadas à parte por scripts/seed-users.mjs,
-- pois exigem a API de Admin do Supabase Auth (senha, etc.), não
-- apenas SQL.
-- =============================================================

-- ---------------------------------------------------------------
-- Festival
-- ---------------------------------------------------------------

insert into public.festivals
  (id, name, slug, description, start_date, end_date, voting_start_at, voting_end_at, status, settings)
values (
  '11111111-1111-1111-1111-111111111111',
  'Sabor de Botequim 2026',
  'sabor-de-botequim-2026',
  'Festival Gastronômico e Cultural de Ribeirão das Neves — edição demonstrativa.',
  current_date,
  current_date + interval '14 days',
  now() - interval '1 day',
  now() + interval '13 days',
  'active',
  '{}'::jsonb
);

-- ---------------------------------------------------------------
-- Categorias de votação
-- ---------------------------------------------------------------

insert into public.voting_categories (id, festival_id, name, slug, description, voting_rule, status, display_order)
values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Melhor Petisco', 'melhor-petisco', 'O petisco que mais conquistou o público do festival.', 'one_per_category', 'active', 1),
  ('21111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'Melhor Atendimento', 'melhor-atendimento', 'O botequim com o atendimento mais caloroso.', 'one_per_category', 'active', 2),
  ('21111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111',
   'Melhor Ambiente', 'melhor-ambiente', 'O ambiente mais acolhedor para curtir o festival.', 'one_per_category', 'active', 3);

-- ---------------------------------------------------------------
-- Restaurantes (2 por categoria)
-- ---------------------------------------------------------------

insert into public.restaurants (
  id, festival_id, name, slug, short_description, description, category_id,
  phone, whatsapp, instagram, address, neighborhood, status, is_featured, display_order
) values
  ('31111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Bar do Zé Grelhados', 'bar-do-ze-grelhados',
   'Petiscos na brasa e cerveja gelada desde 1998.',
   'Tradição de família na Zona Norte de Ribeirão das Neves, especializado em carnes grelhadas e petiscos de boteco.',
   '21111111-1111-1111-1111-111111111111',
   '(31) 3333-0001', '5531999990001', '@bardozegrelhados',
   'Rua das Palmeiras, 120', 'Centro', 'active', true, 1),

  ('31111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
   'Empório Raiz Mineira', 'emporio-raiz-mineira',
   'Sabores de Minas em porções para dividir.',
   'Cardápio inspirado na cozinha mineira tradicional, com toque autoral nos petiscos.',
   '21111111-1111-1111-1111-111111111111',
   '(31) 3333-0002', '5531999990002', '@emporioraizmineira',
   'Av. Brasil, 450', 'Veneza', 'active', false, 2),

  ('31111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111',
   'Boteco da Vila', 'boteco-da-vila',
   'Atendimento de casa e mesa sempre posta.',
   'Um boteco de bairro conhecido pelo carinho no atendimento e pelos garçons que já viraram amigos da vizinhança.',
   '21111111-1111-1111-1111-111111111112',
   '(31) 3333-0003', '5531999990003', '@botecodavila',
   'Rua Sete de Setembro, 88', 'Justinópolis', 'active', true, 3),

  ('31111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111',
   'Recanto do Chopp', 'recanto-do-chopp',
   'Chopp artesanal e atendimento nota dez.',
   'Equipe treinada para receber bem, com chopp sempre gelado e prato do dia recomendado por quem atende.',
   '21111111-1111-1111-1111-111111111112',
   '(31) 3333-0004', '5531999990004', '@recantodochopp',
   'Rua Minas Gerais, 210', 'Sapucaias', 'active', false, 4),

  ('31111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111',
   'Quintal do Sabor', 'quintal-do-sabor',
   'Área externa arborizada e clima de quintal de vó.',
   'Ambiente ao ar livre, mesas de madeira e música ao vivo aos finais de semana.',
   '21111111-1111-1111-1111-111111111113',
   '(31) 3333-0005', '5531999990005', '@quintaldosabor',
   'Rua das Acácias, 33', 'Bela Vista', 'active', true, 5),

  ('31111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111',
   'Botequim Beira-Linha', 'botequim-beira-linha',
   'Decoração retrô e vista para a linha do trem.',
   'Boteco temático com decoração retrô, conhecido pelo ambiente aconchegante e iluminação de bar antigo.',
   '21111111-1111-1111-1111-111111111113',
   '(31) 3333-0006', '5531999990006', '@botequimbeiralinha',
   'Rua da Estação, 77', 'Veneza', 'active', false, 6);

-- ---------------------------------------------------------------
-- Pratos participantes (um por restaurante)
-- ---------------------------------------------------------------

insert into public.dishes (restaurant_id, category_id, name, description, price, status) values
  ('31111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111',
   'Torresmo de Vó', 'Torresmo crocante temperado com ervas da horta da casa, servido com pão de alho.', 32.90, 'active'),
  ('31111111-1111-1111-1111-111111111112', '21111111-1111-1111-1111-111111111111',
   'Pastel de Angu com Costelinha', 'Pastel artesanal recheado com angu cremoso e costelinha desfiada.', 28.50, 'active'),
  ('31111111-1111-1111-1111-111111111113', '21111111-1111-1111-1111-111111111112',
   'Bolinho de Feijão Tropeiro', 'Bolinho crocante recheado com feijão tropeiro da casa, acompanha molho de pimenta.', 24.90, 'active'),
  ('31111111-1111-1111-1111-111111111114', '21111111-1111-1111-1111-111111111112',
   'Linguiça Artesanal na Brasa', 'Linguiça de produção própria, grelhada na hora e servida com mandioca frita.', 34.90, 'active'),
  ('31111111-1111-1111-1111-111111111115', '21111111-1111-1111-1111-111111111113',
   'Petisco do Quintal', 'Seleção da casa com queijo coalho, calabresa acebolada e mandioca frita.', 39.90, 'active'),
  ('31111111-1111-1111-1111-111111111116', '21111111-1111-1111-1111-111111111113',
   'Bolinho de Bacalhau da Linha', 'Receita de família, bacalhau desfiado à mão e fritura no ponto certo.', 36.90, 'active');

-- ---------------------------------------------------------------
-- Galeria (uma foto extra por restaurante, ilustrativa)
-- ---------------------------------------------------------------

insert into public.restaurant_gallery (restaurant_id, image_url, alt_text, display_order)
select id, '/demo/gallery/' || slug || '-1.jpg', 'Ambiente de ' || name, 1
from public.restaurants;

-- ---------------------------------------------------------------
-- Patrocinadores
-- ---------------------------------------------------------------

insert into public.sponsors (festival_id, name, sponsorship_level, status, display_order) values
  ('11111111-1111-1111-1111-111111111111', 'Cervejaria Serra Verde', 'ouro', 'active', 1),
  ('11111111-1111-1111-1111-111111111111', 'Distribuidora Bom Copo', 'prata', 'active', 2),
  ('11111111-1111-1111-1111-111111111111', 'Prefeitura de Ribeirão das Neves', 'apoio institucional', 'active', 3);

-- ---------------------------------------------------------------
-- Seções da landing page (amostra — o editor completo é a Etapa 4)
-- ---------------------------------------------------------------

insert into public.landing_sections (festival_id, section_key, title, subtitle, content, is_active, display_order) values
  ('11111111-1111-1111-1111-111111111111', 'hero', 'Sabor de Botequim',
   'Festival Gastronômico e Cultural de Ribeirão das Neves',
   jsonb_build_object(
     'body', 'Conheça os botequins participantes e vote no seu favorito.',
     'primary_cta', 'Conheça os participantes',
     'secondary_cta', 'Vote agora'
   ), true, 1),
  ('11111111-1111-1111-1111-111111111111', 'presentation', 'Sobre o festival',
   'Gastronomia e cultura popular no coração de Ribeirão das Neves',
   jsonb_build_object(
     'body', 'O Sabor de Botequim celebra os bares e botequins que fazem parte da história da cidade, valorizando gastronomia, música e tradição local.'
   ), true, 2);

-- ---------------------------------------------------------------
-- Configurações públicas (tema) — demonstra get_public_settings()
-- ---------------------------------------------------------------

insert into public.system_settings (festival_id, setting_key, setting_value) values
  ('11111111-1111-1111-1111-111111111111', 'public_theme_colors', jsonb_build_object(
     'primary', '#e05206',
     'secondary', '#7d1d21',
     'accent', '#f2a81d',
     'leaf', '#2f6b4f',
     'cream', '#faf3e7'
   )),
  ('11111111-1111-1111-1111-111111111111', 'public_announcement', jsonb_build_object(
     'enabled', false,
     'message', ''
   ));

-- ---------------------------------------------------------------
-- Eventos de analytics fictícios (últimos 10 dias, por restaurante)
-- ---------------------------------------------------------------

do $$
declare
  v_restaurant record;
  v_day int;
  v_views int;
  v_clicks int;
  v_vote_clicks int;
begin
  for v_restaurant in select id, festival_id from public.restaurants loop
    for v_day in 0..9 loop
      v_views := 20 + floor(random() * 60);
      v_clicks := 5 + floor(random() * 20);
      v_vote_clicks := 2 + floor(random() * 12);

      insert into public.analytics_events (festival_id, restaurant_id, event_name, created_at)
      select v_restaurant.festival_id, v_restaurant.id, 'restaurant_profile_view',
             now() - (v_day || ' days')::interval - (floor(random() * 86400) || ' seconds')::interval
      from generate_series(1, v_views);

      insert into public.analytics_events (festival_id, restaurant_id, event_name, created_at)
      select v_restaurant.festival_id, v_restaurant.id, 'restaurant_card_click',
             now() - (v_day || ' days')::interval - (floor(random() * 86400) || ' seconds')::interval
      from generate_series(1, v_clicks);

      insert into public.analytics_events (festival_id, restaurant_id, event_name, created_at)
      select v_restaurant.festival_id, v_restaurant.id, 'vote_button_click',
             now() - (v_day || ' days')::interval - (floor(random() * 86400) || ' seconds')::interval
      from generate_series(1, v_vote_clicks);
    end loop;
  end loop;

  insert into public.analytics_events (festival_id, event_name, created_at)
  select '11111111-1111-1111-1111-111111111111', 'landing_view',
         now() - (floor(random() * 10) || ' days')::interval
  from generate_series(1, 400);
end;
$$;

-- ---------------------------------------------------------------
-- Votos fictícios via register_vote() — mesmas regras de negócio
-- de um voto real.
--
-- IMPORTANTE: o salt/chave abaixo são exclusivos deste seed de
-- demonstração e propositalmente DIFERENTES de CPF_HASH_SALT /
-- CPF_ENCRYPTION_KEY do .env real. Nunca copie segredos de produção
-- para um arquivo versionado — register_vote() apenas precisa de
-- valores consistentes entre si para os votos fictícios funcionarem;
-- não precisa (e não deve) usar os mesmos segredos da aplicação.
-- ---------------------------------------------------------------

do $$
declare
  v_salt text := 'demo-seed-salt-nao-usar-em-producao-3f9a1c';
  v_key text := 'demo-seed-key-nao-usar-em-producao-7b2e6d';
  v_counter int := 0;
  v_plan record;
  v_i int;
  v_cpf text;
begin
  for v_plan in
    select * from (values
      ('31111111-1111-1111-1111-111111111111'::uuid, '21111111-1111-1111-1111-111111111111'::uuid, 18),
      ('31111111-1111-1111-1111-111111111112'::uuid, '21111111-1111-1111-1111-111111111111'::uuid, 12),
      ('31111111-1111-1111-1111-111111111113'::uuid, '21111111-1111-1111-1111-111111111112'::uuid, 15),
      ('31111111-1111-1111-1111-111111111114'::uuid, '21111111-1111-1111-1111-111111111112'::uuid, 9),
      ('31111111-1111-1111-1111-111111111115'::uuid, '21111111-1111-1111-1111-111111111113'::uuid, 22),
      ('31111111-1111-1111-1111-111111111116'::uuid, '21111111-1111-1111-1111-111111111113'::uuid, 7)
    ) as t(restaurant_id, category_id, vote_count)
  loop
    for v_i in 1..v_plan.vote_count loop
      v_counter := v_counter + 1;
      v_cpf := lpad((100000000 + v_counter)::text, 11, '0');

      perform public.register_vote(
        p_festival_id        => '11111111-1111-1111-1111-111111111111',
        p_category_id        => v_plan.category_id,
        p_restaurant_id       => v_plan.restaurant_id,
        p_dish_id             => null,
        p_voter_name          => 'Eleitor Demonstrativo ' || lpad(v_counter::text, 3, '0'),
        p_voter_cpf           => v_cpf,
        p_cpf_hash_salt       => v_salt,
        p_cpf_encryption_key  => v_key,
        p_consent_privacy     => true,
        p_consent_regulation  => true,
        p_terms_version       => '1.0',
        p_ip_hash             => encode(extensions.digest('demo-ip-' || v_counter, 'sha256'), 'hex'),
        p_user_agent          => 'seed-script/1.0',
        p_risk_score          => 0,
        p_risk_reasons        => '[]'::jsonb
      );
    end loop;
  end loop;
end;
$$;
