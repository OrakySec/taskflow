"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { auth } from "@/lib/auth";

export async function authenticate(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Verificar o role do usuário logado para decidir o redirecionamento
    const session = await auth();
    if (session?.user?.role === "SUPER_ADMIN") {
      return { success: true, redirectTo: "/admin" };
    }
    return { success: true, redirectTo: "/" };
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
