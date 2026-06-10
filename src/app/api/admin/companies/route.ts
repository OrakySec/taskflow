import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  adminName: z.string().min(2, "Nome do admin deve ter pelo menos 2 caracteres"),
  adminEmail: z.string().email("E-mail inválido"),
  adminPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
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
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { companyName, adminName, adminEmail, adminPassword } = parsed.data;

  // Verifica e-mail duplicado
  const existing = await prisma.user.findFirst({ where: { email: adminEmail } });
  if (existing) {
    return NextResponse.json({ error: "Este e-mail já está em uso em outra empresa." }, { status: 409 });
  }

  let slug = generateSlug(companyName);
  const slugExists = await prisma.company.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, slug },
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const user = await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        companyId: company.id,
      },
    });

    await tx.notificationConfig.create({
      data: { companyId: company.id },
    });

    return { company, user };
  });

  return NextResponse.json({
    message: "Empresa criada com sucesso!",
    companyId: result.company.id,
    companyName: result.company.name,
    adminEmail: result.user.email,
  }, { status: 201 });
}
