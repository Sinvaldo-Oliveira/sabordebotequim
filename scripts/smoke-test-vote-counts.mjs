import { createClient } from "@supabase/supabase-js";

const festivalId = "11111111-1111-1111-1111-111111111111";

const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// 1) Público consegue chamar a RPC e recebe só agregados
const { data: counts, error } = await anon.rpc("get_public_vote_counts", {
  p_festival_id: festivalId,
});
console.log("RPC get_public_vote_counts (anon):", error ? `FALHOU: ${error.message}` : "OK");
console.log("Total de linhas (uma por restaurante):", counts?.length);
console.log("Amostra:", counts?.slice(0, 3));

// 2) Confirma que anon continua sem acesso direto à tabela votes
const votes = await anon.from("votes").select("*").limit(1);
console.log(
  "anon lendo votes diretamente (deve retornar vazio):",
  votes.error ? `bloqueado (${votes.error.message})` : `retornou ${votes.data.length} linha(s)`,
);

// 3) Admin desativa a exibição de contagem e confirma que a RPC zera para o público
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
await admin.auth.signInWithPassword({
  email: "admin@sabordebotequim.demo",
  password: process.env.DEMO_PASSWORD,
});
await admin.from("system_settings").upsert(
  {
    festival_id: festivalId,
    setting_key: "public_show_vote_counts",
    setting_value: { enabled: false },
  },
  { onConflict: "festival_id,setting_key" },
);

const { data: countsHidden } = await anon.rpc("get_public_vote_counts", {
  p_festival_id: festivalId,
});
console.log(
  "Com toggle desativado, público recebe tudo zerado:",
  countsHidden?.every((c) => c.votes_count === 0),
);

const { data: countsAdmin } = await admin.rpc("get_public_vote_counts", {
  p_festival_id: festivalId,
});
console.log(
  "Mesmo com toggle desativado, ADMIN continua vendo valores reais:",
  JSON.stringify(countsAdmin?.slice(0, 3)),
);

// Restaura o padrão (exibir contagem) para não deixar a demo no escuro.
await admin.from("system_settings").upsert(
  {
    festival_id: festivalId,
    setting_key: "public_show_vote_counts",
    setting_value: { enabled: true },
  },
  { onConflict: "festival_id,setting_key" },
);
await admin.auth.signOut();
console.log("Configuração restaurada para 'exibir'.");
