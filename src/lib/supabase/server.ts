import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Autenticado pela sessão do usuário (cookies) — RLS é aplicada normalmente.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado a partir de um Server Component (sem permissão de escrita
          // de cookies). Seguro ignorar: o middleware mantém a sessão renovada.
        }
      },
    },
  });
}
