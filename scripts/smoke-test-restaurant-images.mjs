import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
await admin.auth.signInWithPassword({
  email: "admin@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});

const restaurantId = "31111111-1111-1111-1111-111111111112"; // Empório Raiz Mineira

const PNG_1PX_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const bytes = Buffer.from(PNG_1PX_BASE64, "base64");

async function upload(purpose) {
  const file = new File([bytes], `${purpose}.png`, { type: "image/png" });
  const path = `restaurants/${restaurantId}/${purpose}-${Date.now()}.png`;
  const { error } = await admin.storage
    .from("restaurant-media")
    .upload(path, file, { cacheControl: "3600", contentType: "image/png" });
  if (error) throw new Error(`upload ${purpose} falhou: ${error.message}`);
  return admin.storage.from("restaurant-media").getPublicUrl(path).data.publicUrl;
}

const logoUrl = await upload("logo");
const cardUrl = await upload("card");
const bannerUrl = await upload("banner");
console.log("Uploads OK:", { logoUrl, cardUrl, bannerUrl });

// Simula updateRestaurant salvando os 3 campos
const { error: updateError } = await admin
  .from("restaurants")
  .update({ logo_url: logoUrl, card_image_url: cardUrl, banner_url: bannerUrl })
  .eq("id", restaurantId);
console.log("Update:", updateError ? `FALHOU: ${updateError.message}` : "OK");

await admin.auth.signOut();

// Público (anon) lê o restaurante e confirma os 3 campos distintos
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const { data } = await anon
  .from("restaurants")
  .select("name, logo_url, card_image_url, banner_url")
  .eq("id", restaurantId)
  .single();
console.log("Restaurante público:", data);
console.log(
  "3 campos distintos e preenchidos:",
  data.logo_url === logoUrl && data.card_image_url === cardUrl && data.banner_url === bannerUrl,
);
