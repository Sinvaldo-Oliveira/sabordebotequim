import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, anonKey);

async function testLogin(email, password, label) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log(`[${label}] FALHA no login:`, error.message);
    return;
  }
  console.log(`[${label}] Login OK, user id: ${data.user.id}`);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, status")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    console.log(`[${label}] FALHA ao ler profile (RLS?):`, profileError.message);
  } else {
    console.log(`[${label}] Profile via RLS:`, profile);
  }

  await supabase.auth.signOut();
}

await testLogin("admin@sabordebotequim.demo", process.env.DEMO_PASSWORD, "admin");
await testLogin("bardozegrelhados@sabordebotequim.demo", process.env.DEMO_PASSWORD, "restaurante");

// Também valida que o público consegue ler restaurante ativo (RLS pública)
const { data: publicRestaurants, error: publicError } = await supabase
  .from("restaurants")
  .select("name, status")
  .limit(3);
console.log("\n[anon] Restaurantes públicos visíveis:", publicError ? publicError.message : publicRestaurants);

// E que o anon NÃO consegue ler votos (RLS deve bloquear)
const { data: votesLeak, error: votesError } = await supabase.from("votes").select("*").limit(1);
console.log(
  "[anon] Tentativa de ler votes (deve falhar/retornar vazio):",
  votesError ? `bloqueado (${votesError.message})` : `retornou ${votesLeak.length} linha(s)`,
);
