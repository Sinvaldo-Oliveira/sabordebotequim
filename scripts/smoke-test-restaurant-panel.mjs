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
  console.error("FALHA no login:", authError.message);
  process.exit(1);
}

const {
  data: { user },
} = await supabase.auth.getUser();

const { data: restaurant, error: restaurantError } = await supabase
  .from("restaurants")
  .select("id, name, status, neighborhood, city, category_id, phone, whatsapp, instagram")
  .eq("owner_user_id", user.id)
  .is("deleted_at", null)
  .maybeSingle();

console.log("Restaurante:", restaurantError?.message ?? restaurant);

if (restaurant) {
  const { data: metrics, error: metricsError } = await supabase.rpc("get_restaurant_metrics", {
    p_restaurant_id: restaurant.id,
  });
  console.log("Métricas:", metricsError?.message ?? JSON.stringify(metrics, null, 2));
}

await supabase.auth.signOut();
