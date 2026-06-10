import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "MANAGER", "COLLABORATOR"]).default("COLLABORATOR"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Apenas ADMINs podem criar usuários diretamente
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;

  // Verifica se já existe usuário com esse e-mail na empresa
  const existing = await prisma.user.findFirst({
    where: { email, companyId: session.user.companyId },
  });

  if (existing) {
    return NextResponse.json({ error: "Este e-mail já está cadastrado na sua empresa." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      companyId: session.user.companyId,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ message: "Usuário criado com sucesso!", user }, { status: 201 });
}
