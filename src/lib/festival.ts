import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type Festival = Database["public"]["Tables"]["festivals"]["Row"];

/**
 * Retorna o festival "corrente" para telas administrativas: o mais
 * recente entre os que não estão em rascunho. O sistema é multi-festival
 * no banco, mas esta primeira versão opera sempre sobre um único festival
 * ativo por vez.
 */
export async function getCurrentFestival(): Promise<Festival | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("festivals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}
