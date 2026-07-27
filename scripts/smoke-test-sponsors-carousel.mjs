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

// 1) Admin faz upload de uma logo real para o bucket festival-media
const PNG_1PX_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const bytes = Buffer.from(PNG_1PX_BASE64, "base64");
const file = new File([bytes], "logo.png", { type: "image/png" });
const path = `sponsor/${Date.now()}.png`;
const upload = await admin.storage
  .from("festival-media")
  .upload(path, file, { cacheControl: "3600", contentType: file.type });
console.log("Upload de logo:", upload.error ? `FALHOU: ${upload.error.message}` : "OK");
const { data: publicUrl } = admin.storage.from("festival-media").getPublicUrl(path);

// 2) Admin cria dois patrocinadores (um ativo, um inativo)
const s1 = await admin
  .from("sponsors")
  .insert({
    festival_id: festivalId,
    name: "Patrocinador Teste Ativo",
    logo_url: publicUrl.publicUrl,
    website_url: "https://example.com",
    sponsorship_level: "ouro",
    display_order: 100,
  })
  .select("id")
  .single();
console.log("Patrocinador ativo:", s1.error ? `FALHOU: ${s1.error.message}` : `OK id=${s1.data.id}`);

const s2 = await admin
  .from("sponsors")
  .insert({
    festival_id: festivalId,
    name: "Patrocinador Teste Inativo",
    logo_url: publicUrl.publicUrl,
    status: "inactive",
    display_order: 101,
  })
  .select("id")
  .single();
console.log("Patrocinador inativo:", s2.error ? `FALHOU: ${s2.error.message}` : `OK id=${s2.data.id}`);

// 3) Config do carrossel
const settings = await admin.from("system_settings").upsert(
  {
    festival_id: festivalId,
    setting_key: "public_sponsors_carousel",
    setting_value: { enabled: true, speed_seconds: 25 },
  },
  { onConflict: "festival_id,setting_key" },
);
console.log("Config salva:", settings.error ? `FALHOU: ${settings.error.message}` : "OK");

await admin.auth.signOut();

// 4) Público (anon) só vê os ativos
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const publicSponsors = await anon
  .from("sponsors")
  .select("id, name, status")
  .eq("festival_id", festivalId)
  .in("id", [s1.data?.id, s2.data?.id].filter(Boolean));
console.log("Patrocinadores visíveis ao público (só ativos):", publicSponsors.data);

const { data: publicSettings } = await anon.rpc("get_public_settings", {
  p_festival_id: festivalId,
});
console.log("Config via RPC pública:", publicSettings?.public_sponsors_carousel);

// 5) Limpa os dados de teste
const adminCleanup = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
await adminCleanup.auth.signInWithPassword({
  email: "admin@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});
if (s1.data) await adminCleanup.from("sponsors").delete().eq("id", s1.data.id);
if (s2.data) await adminCleanup.from("sponsors").delete().eq("id", s2.data.id);
await adminCleanup.from("system_settings").delete().match({
  festival_id: festivalId,
  setting_key: "public_sponsors_carousel",
});
await adminCleanup.auth.signOut();
console.log("Dados de teste removidos.");
