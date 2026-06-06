import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Rotas públicas que não precisam de auth
  const publicRoutes = ["/login", "/register", "/invite", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Se não está autenticado e a rota não é pública, redireciona pro login
  if (!isAuthenticated && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Se autenticado
  if (isAuthenticated) {
    const isClient = userRole === "CLIENT";

    // Regras exclusivas para CLIENTE
    if (isClient) {
      // Se tenta ir para o login ou raiz, redireciona para o portal
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        return NextResponse.redirect(new URL("/portal", req.url));
      }

      // Se tenta acessar qualquer coisa que não seja /portal ou /api, bloqueia e manda pro portal
      if (!pathname.startsWith("/portal") && !pathname.startsWith("/api") && !pathname.startsWith("/_next") && pathname !== "/favicon.ico") {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    } 
    // Regras para ADMIN, MANAGER, COLLABORATOR
    else {
      // Se tenta ir para o login ou raiz, redireciona para o dashboard
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
