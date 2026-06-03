import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { token, name, password } = parsed.data;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { company: true },
  });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Convite inválido ou expirado." }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { email: invite.email, companyId: invite.companyId } });
  if (existing) return NextResponse.json({ error: "Este e-mail já possui uma conta." }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        name,
        email: invite.email,
        password: hashedPassword,
        role: invite.role,
        companyId: invite.companyId,
      },
    });
    await tx.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  });

  return NextResponse.json({ message: "Conta criada com sucesso!" }, { status: 201 });
}
