// Cria as contas demonstrativas de acesso (1 admin + 2 restaurantes).
// Precisa da API de Admin do Supabase Auth — por isso é um script Node,
// não faz parte das migrations SQL.
//
// Uso: node --env-file=.env scripts/seed-users.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar este script.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const FESTIVAL_ID = "11111111-1111-1111-1111-111111111111";
const RESTAURANT_1_ID = "31111111-1111-1111-1111-111111111111"; // Bar do Zé Grelhados
const RESTAURANT_2_ID = "31111111-1111-1111-1111-111111111113"; // Boteco da Vila

const DEMO_USERS = [
  {
    email: "admin@sabordebotequim.demo",
    password: process.env.DEMO_PASSWORD,
    fullName: "Administração do Festival (demo)",
    role: "superadmin",
    restaurantId: null,
  },
  {
    email: "bardozegrelhados@sabordebotequim.demo",
    password: process.env.DEMO_PASSWORD,
    fullName: "Bar do Zé Grelhados (demo)",
    role: "restaurant",
    restaurantId: RESTAURANT_1_ID,
  },
  {
    email: "botecodavila@sabordebotequim.demo",
    password: process.env.DEMO_PASSWORD,
    fullName: "Boteco da Vila (demo)",
    role: "restaurant",
    restaurantId: RESTAURANT_2_ID,
  },
];

async function main() {
  for (const user of DEMO_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });

    if (error) {
      console.error(`Falha ao criar ${user.email}:`, error.message);
      continue;
    }

    const userId = data.user.id;

    // O trigger private.handle_new_user() já criou o profile com role
    // 'restaurant'; promovemos para superadmin quando necessário.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: user.role, status: "active" })
      .eq("id", userId);

    if (profileError) {
      console.error(`Falha ao atualizar profile de ${user.email}:`, profileError.message);
      continue;
    }

    if (user.restaurantId) {
      const { error: restaurantError } = await supabase
        .from("restaurants")
        .update({ owner_user_id: userId })
        .eq("id", user.restaurantId)
        .eq("festival_id", FESTIVAL_ID);

      if (restaurantError) {
        console.error(
          `Falha ao vincular ${user.email} ao restaurante:`,
          restaurantError.message,
        );
        continue;
      }
    }

    console.log(`OK: ${user.email} (${user.role})`);
  }

  console.log("\nContas demonstrativas — senha para todas: definida em DEMO_PASSWORD");
}

main();
