import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  name: z.string().min(2, "Seu nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  // Desativado temporariamente
  return NextResponse.json(
    { error: "A criação de novas contas está temporariamente desativada. O sistema é restrito apenas a convidados no momento." },
    { status: 403 }
  );

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { companyName, name, email, password } = parsed.data;

    // Verifica se o e-mail já existe
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 409 }
      );
    }

    // Gera um slug único para a empresa
    let slug = generateSlug(companyName);
    const slugExists = await prisma.company.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    // Cria empresa + usuário admin em transação
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
        },
      });

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
          companyId: company.id,
        },
      });

      // Cria configuração de notificações padrão
      await tx.notificationConfig.create({
        data: { companyId: company.id },
      });

      return { company, user };
    });

    return NextResponse.json(
      {
        message: "Conta criada com sucesso!",
        companyId: result.company.id,
        userId: result.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
