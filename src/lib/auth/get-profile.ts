import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Role } from "@/lib/auth/roles";

export type CurrentProfile = {
  id: string;
  email: string | undefined;
  fullName: string | null;
  role: Role;
  status: string;
};

/**
 * Retorna o perfil do usuário autenticado (tabela profiles) ou null.
 * A tabela é criada na Etapa 3 — sem ela, retorna null e os layouts
 * protegidos tratam como não autorizado.
 *
 * Também retorna null (em vez de lançar) quando o Supabase ainda não foi
 * configurado, para que as rotas protegidas redirecionem ao login em vez
 * de derrubar a página com um erro 500.
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, status")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: user.email,
    fullName: data.full_name,
    role: data.role,
    status: data.status,
  };
}
