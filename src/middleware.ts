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

  // Copia os cookies eventualmente renovados por getUser() (setAll acima)
  // para a resposta de redirecionamento. Sem isso, um token de acesso
  // expirado é renovado mas o cookie novo nunca chega ao navegador — na
  // próxima requisição o middleware tenta renovar de novo com o mesmo
  // refresh token (de uso único), falha, e gera loop entre a página de
  // login e a área protegida (ERR_TOO_MANY_REDIRECTS).
  function redirectWithRefreshedCookies(url: URL) {
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (!user && (isAdminArea || isPanelArea)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminArea
      ? "/admin/login"
      : "/painel-restaurante/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirecionar", pathname);
    return redirectWithRefreshedCookies(redirectUrl);
  }

  if (user && (isAdminLogin || isPanelLogin)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminLogin ? "/admin" : "/painel-restaurante";
    redirectUrl.search = "";
    return redirectWithRefreshedCookies(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/painel-restaurante/:path*"],
};
