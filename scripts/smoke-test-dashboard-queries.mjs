// Executa, com a sessão real do admin, exatamente as mesmas consultas que
// src/app/admin/(protected)/page.tsx faz, para garantir que rodam sem erro
// contra o banco remoto antes de confiar no SSR.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const { error: authError } = await supabase.auth.signInWithPassword({
  email: "admin@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});
if (authError) {
  console.error("FALHA no login:", authError.message);
  process.exit(1);
}

const { data: festival } = await supabase
  .from("festivals")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
console.log("Festival:", festival.name, festival.status);

const now = new Date();
const weekAgo = new Date(now.getTime() - 7 * 86400000);
const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

const results = await Promise.all([
  supabase.rpc("get_admin_dashboard_stats", { p_festival_id: festival.id }),
  supabase
    .from("votes")
    .select("created_at")
    .eq("festival_id", festival.id)
    .eq("status", "valid")
    .gte("created_at", twoWeeksAgo.toISOString()),
  supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("festival_id", festival.id)
    .eq("event_name", "landing_view")
    .gte("created_at", weekAgo.toISOString()),
  supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("festival_id", festival.id)
    .eq("event_name", "vote_button_click")
    .gte("created_at", weekAgo.toISOString()),
  supabase
    .from("restaurants")
    .select("id, name, status, category_id, created_at")
    .eq("festival_id", festival.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5),
  supabase.from("voting_categories").select("id, name").eq("festival_id", festival.id),
]);

const labels = [
  "get_admin_dashboard_stats",
  "votes (14d)",
  "analytics_events landing_view (7d, count)",
  "analytics_events vote_button_click (7d, count)",
  "restaurants recentes",
  "voting_categories",
];

let allOk = true;
results.forEach((r, i) => {
  if (r.error) {
    allOk = false;
    console.error(`FALHA [${labels[i]}]:`, r.error.message);
  } else {
    const info = "count" in r ? `count=${r.count}` : `rows=${Array.isArray(r.data) ? r.data.length : "n/a"}`;
    console.log(`OK [${labels[i]}]:`, info);
  }
});

await supabase.auth.signOut();
console.log(allOk ? "\nTodas as consultas passaram." : "\nHOUVE FALHAS acima.");
process.exit(allOk ? 0 : 1);
