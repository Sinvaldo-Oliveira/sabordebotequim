import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";

/**
 * Protege as áreas autenticadas (/admin e /painel-restaurante):
 * renova a sessão do Supabase e redireciona visitantes não autenticados
 * para a tela de login correspondente. A verificação de papel (role) é
 * feita nos layouts protegidos, no servidor.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambiente ainda sem Supabase configurado: não bloquear o desenvolvimento.
  if (!hasSupabaseEnv()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminLogin = pathname === "/admin/login";
  const isPanelLogin = pathname === "/painel-restaurante/login";
  const isAdminArea = pathname.startsWith("/admin") && !isAdminLogin;
  const isPanelArea =
    pathname.startsWith("/painel-restaurante") && !isPanelLogin;

  if (!user && (isAdminArea || isPanelArea)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminArea
      ? "/admin/login"
      : "/painel-restaurante/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirecionar", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (isAdminLogin || isPanelLogin)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminLogin ? "/admin" : "/painel-restaurante";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/painel-restaurante/:path*"],
};
