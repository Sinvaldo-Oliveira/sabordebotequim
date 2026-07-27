// Simula, com a sessão real do admin (RLS aplicada, não service role), as
// mesmas operações que os Server Actions do painel admin executam:
// criar restaurante, criar categoria, ativar/desativar, e chamar a RPC de
// estatísticas. Remove os registros de teste ao final.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: "admin@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});
if (authError) {
  console.error("FALHA no login do admin:", authError.message);
  process.exit(1);
}
console.log("Login admin OK:", authData.user.id);

const { data: festival, error: festivalError } = await supabase
  .from("festivals")
  .select("id, name")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
if (festivalError || !festival) {
  console.error("FALHA ao buscar festival:", festivalError?.message);
  process.exit(1);
}
console.log("Festival:", festival.name);

// 1) Criar categoria de teste
const { data: category, error: categoryError } = await supabase
  .from("voting_categories")
  .insert({
    festival_id: festival.id,
    name: "Categoria Teste Smoke",
    slug: "categoria-teste-smoke",
    voting_rule: "one_per_category",
    status: "active",
    display_order: 99,
  })
  .select("id, name")
  .single();
if (categoryError) {
  console.error("FALHA ao criar categoria:", categoryError.message);
  process.exit(1);
}
console.log("Categoria criada:", category.name, category.id);

// 2) Criar restaurante de teste vinculado à categoria
const { data: restaurant, error: restaurantError } = await supabase
  .from("restaurants")
  .insert({
    festival_id: festival.id,
    name: "Restaurante Teste Smoke",
    slug: "restaurante-teste-smoke",
    category_id: category.id,
    status: "pending",
    city: "Ribeirão das Neves",
    state: "MG",
  })
  .select("id, name, status")
  .single();
if (restaurantError) {
  console.error("FALHA ao criar restaurante:", restaurantError.message);
  process.exit(1);
}
console.log("Restaurante criado:", restaurant.name, restaurant.status);

// 3) Ativar o restaurante (toggle de status)
const { error: toggleError } = await supabase
  .from("restaurants")
  .update({ status: "active" })
  .eq("id", restaurant.id);
if (toggleError) {
  console.error("FALHA ao ativar restaurante:", toggleError.message);
} else {
  console.log("Restaurante ativado com sucesso.");
}

// 4) Chamar a RPC de estatísticas do dashboard
const { data: stats, error: statsError } = await supabase.rpc("get_admin_dashboard_stats", {
  p_festival_id: festival.id,
});
if (statsError) {
  console.error("FALHA na RPC get_admin_dashboard_stats:", statsError.message);
} else {
  console.log("Estatísticas do dashboard:", stats);
}

// 5) Limpeza — remove os registros de teste
await supabase.from("restaurants").delete().eq("id", restaurant.id);
await supabase.from("voting_categories").delete().eq("id", category.id);
console.log("Registros de teste removidos.");

await supabase.auth.signOut();
console.log("\nSmoke test concluído com sucesso.");
