"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Cliente Supabase para o navegador.
 * Usa somente a chave anônima — todo acesso passa pelas policies de RLS.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
