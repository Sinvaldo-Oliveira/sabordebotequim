import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const { error: authError } = await supabase.auth.signInWithPassword({
  email: "bardozegrelhados@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});
if (authError) {
  console.error("FALHA login:", authError.message);
  process.exit(1);
}
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Login OK:", user.id);

const { data: restaurant } = await supabase
  .from("restaurants")
  .select("id, festival_id")
  .eq("owner_user_id", user.id)
  .maybeSingle();
console.log("Restaurante:", restaurant.id);

// 1. Upload de imagem para o Storage (testa RLS de escrita por dono)
const fakeImage = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
const path = `restaurants/${restaurant.id}/smoke-test-${Date.now()}.png`;
const { error: uploadError } = await supabase.storage
  .from("restaurant-media")
  .upload(path, fakeImage, { contentType: "image/png" });
console.log("Upload de imagem:", uploadError ? `FALHOU (${uploadError.message})` : "OK");

// 2. Tenta subir para a pasta de OUTRO restaurante (deve ser bloqueado pela RLS)
const otherPath = `restaurants/31111111-1111-1111-1111-111111111112/smoke-test.png`;
const { error: otherError } = await supabase.storage
  .from("restaurant-media")
  .upload(otherPath, fakeImage, { contentType: "image/png" });
console.log(
  "Upload em restaurante alheio (deve falhar):",
  otherError ? `bloqueado (${otherError.message})` : "PASSOU (falha de segurança!)",
);

// 3. Atualiza o perfil diretamente (sem aprovação configurada = publica direto)
const { error: updateError } = await supabase
  .from("restaurants")
  .update({ short_description: "Teste smoke — descrição atualizada via painel" })
  .eq("id", restaurant.id);
console.log("Update direto do perfil:", updateError ? `FALHOU (${updateError.message})` : "OK");

// 4. Galeria: adicionar e remover
const { data: galleryRow, error: galleryError } = await supabase
  .from("restaurant_gallery")
  .insert({ restaurant_id: restaurant.id, image_url: "https://example.com/x.jpg" })
  .select("id")
  .single();
console.log("Adicionar à galeria:", galleryError ? `FALHOU (${galleryError.message})` : "OK");
if (galleryRow) {
  const { error: delError } = await supabase
    .from("restaurant_gallery")
    .delete()
    .eq("id", galleryRow.id);
  console.log("Remover da galeria:", delError ? `FALHOU (${delError.message})` : "OK");
}

// 5. Ativa exigência de aprovação e confirma que o dono NÃO pode ativar sozinho
// (o restaurante não tem permissão de admin em system_settings — deve falhar)
const { error: settingsError } = await supabase.from("system_settings").upsert({
  festival_id: restaurant.festival_id,
  setting_key: "restaurant_edits_require_approval",
  setting_value: { enabled: true },
});
console.log(
  "Restaurante tentando mudar configuração admin (deve falhar):",
  settingsError ? `bloqueado (${settingsError.message})` : "PASSOU (falha de segurança!)",
);

await supabase.auth.signOut();
console.log("\nSmoke test concluído.");
