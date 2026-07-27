import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

await supabase.auth.signInWithPassword({
  email: "admin@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});

const festivalId = "11111111-1111-1111-1111-111111111111";

const { error: onError } = await supabase.from("system_settings").upsert(
  {
    festival_id: festivalId,
    setting_key: "restaurant_edits_require_approval",
    setting_value: { enabled: true },
  },
  { onConflict: "festival_id,setting_key" },
);
console.log("Admin ativa aprovação:", onError ? `FALHOU (${onError.message})` : "OK");

const { data: check } = await supabase
  .from("system_settings")
  .select("setting_value")
  .eq("festival_id", festivalId)
  .eq("setting_key", "restaurant_edits_require_approval")
  .maybeSingle();
console.log("Valor salvo:", check?.setting_value);

// Restaura para o padrão (não exigir aprovação), para não afetar a demo.
const { error: offError } = await supabase.from("system_settings").upsert(
  {
    festival_id: festivalId,
    setting_key: "restaurant_edits_require_approval",
    setting_value: { enabled: false },
  },
  { onConflict: "festival_id,setting_key" },
);
console.log("Admin desativa aprovação (reset):", offError ? `FALHOU (${offError.message})` : "OK");

await supabase.auth.signOut();
