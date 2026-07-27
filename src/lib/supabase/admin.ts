import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente com service role — ignora RLS.
 * Uso EXCLUSIVO no servidor, dentro de Server Actions ou Route Handlers que
 * já verificaram a permissão do chamador. Nunca importar em código de cliente.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  return createSupabaseClient<Database>(url, getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
