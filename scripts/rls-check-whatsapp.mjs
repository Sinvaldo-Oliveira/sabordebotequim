import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const v = await supabase.from("vote_verifications").select("*").limit(1);
console.log(
  "anon vote_verifications:",
  v.error ? `bloqueado (${v.error.message})` : `VAZOU ${v.data.length} linha(s)`,
);

const votes = await supabase.from("votes").select("*").limit(1);
console.log(
  "anon votes:",
  votes.error ? `bloqueado (${votes.error.message})` : `retornou ${votes.data.length} linha(s)`,
);

const rpc = await supabase.rpc("verify_vote_otp", {
  p_verification_id: 1,
  p_otp_hash_attempt: "x",
});
console.log(
  "anon verify_vote_otp:",
  rpc.error ? `bloqueado (${rpc.error.message})` : "EXECUTOU (falha de segurança)",
);
