"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAdminRole, isRestaurantRole } from "@/lib/auth/roles";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

type LoginArea = "admin" | "restaurant";

const AREA_HOME: Record<LoginArea, string> = {
  admin: "/admin",
  restaurant: "/painel-restaurante",
};

const AREA_LOGIN: Record<LoginArea, string> = {
  admin: "/admin/login",
  restaurant: "/painel-restaurante/login",
};

export type AuthActionResult = { error: string } | undefined;

/**
 * Autentica e-mail/senha e valida se o papel do usuário corresponde à área.
 * Em caso de sucesso redireciona; em caso de falha retorna mensagem amigável.
 */
export async function signIn(
  area: LoginArea,
  credentials: LoginInput,
  redirectTo?: string,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return { error: "Verifique o e-mail e a senha informados." };
  }

  if (!hasSupabaseEnv()) {
    return {
      error:
        "O sistema ainda está sendo configurado e o login não está disponível no momento.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  const profile = await getCurrentProfile();
  const authorized =
    area === "admin"
      ? isAdminRole(profile?.role)
      : isRestaurantRole(profile?.role);

  if (!profile || !authorized || profile.status !== "active") {
    await supabase.auth.signOut();
    return { error: "Este acesso não está autorizado para esta área." };
  }

  const destination =
    redirectTo && redirectTo.startsWith(AREA_HOME[area])
      ? redirectTo
      : AREA_HOME[area];
  redirect(destination);
}

export async function signOut(area: LoginArea): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(AREA_LOGIN[area]);
}
