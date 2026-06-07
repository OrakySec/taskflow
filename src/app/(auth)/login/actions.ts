"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha incorretos." };
        default:
          return { error: "Ocorreu um erro no servidor ao tentar fazer login. (" + error.type + ")" };
      }
    }
    // Auth.js `signIn` can throw other things or just Redirect errors.
    // If redirect: false is passed, it shouldn't throw a Redirect error on success.
    console.error("Auth error:", error);
    return { error: "Erro inesperado ao conectar." };
  }
}
