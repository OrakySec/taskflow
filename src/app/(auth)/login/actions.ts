"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function authenticate(email: string, password: string) {
  try {
    // Busca o role ANTES do signIn para evitar problema de timing com cookie de sessão
    const user = await prisma.user.findFirst({
      where: { email, isActive: true },
      select: { role: true },
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Se chegou aqui, login foi bem-sucedido
    const isSuperAdmin = (user?.role as string) === "SUPER_ADMIN";
    return { success: true, redirectTo: isSuperAdmin ? "/admin" : "/" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha incorretos." };
        default:
          return { error: "Ocorreu um erro no servidor ao tentar fazer login. (" + error.type + ")" };
      }
    }
    console.error("Auth error:", error);
    return { error: "Erro inesperado ao conectar." };
  }
}

