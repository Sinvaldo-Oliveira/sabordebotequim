import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
await admin.auth.signInWithPassword({
  email: "admin@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});

const festivalId = "11111111-1111-1111-1111-111111111111";

// 1) Admin cria dois slides
const slide1 = await admin.from("hero_slides").insert({
  festival_id: festivalId,
  image_url: "https://picsum.photos/seed/botequim1/1920/1080",
  title: "Sabor de Botequim 2026",
  subtitle: "Vote no seu botequim favorito",
  cta_label: "Vote agora",
  cta_href: "/#restaurantes",
  display_order: 0,
}).select("id").single();
console.log("Slide 1:", slide1.error ? `FALHOU: ${slide1.error.message}` : `OK id=${slide1.data.id}`);

const slide2 = await admin.from("hero_slides").insert({
  festival_id: festivalId,
  image_url: "https://picsum.photos/seed/botequim2/1920/1080",
  title: "Petiscos e cultura popular",
  display_order: 1,
  is_active: false,
}).select("id").single();
console.log("Slide 2 (oculto):", slide2.error ? `FALHOU: ${slide2.error.message}` : `OK id=${slide2.data.id}`);

// 2) Admin salva config
const settings = await admin.from("system_settings").upsert(
  {
    festival_id: festivalId,
    setting_key: "public_hero_carousel",
    setting_value: { enabled: true, autoplay_seconds: 5 },
  },
  { onConflict: "festival_id,setting_key" },
);
console.log("Config salva:", settings.error ? `FALHOU: ${settings.error.message}` : "OK");

await admin.auth.signOut();

// 3) Público (anon) só enxerga slides ativos
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const publicSlides = await anon
  .from("hero_slides")
  .select("id, title, is_active")
  .eq("festival_id", festivalId);
console.log("Slides visíveis ao público (só ativos):", publicSlides.data);

// 4) Config pública via RPC
const { data: publicSettings } = await anon.rpc("get_public_settings", {
  p_festival_id: festivalId,
});
console.log("Config via RPC pública:", publicSettings?.public_hero_carousel);
