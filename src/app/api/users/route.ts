import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/email";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["ADMIN", "MANAGER", "COLLABORATOR"]).default("COLLABORATOR"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedTasks: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, role } = parsed.data;

  // Verifica se já existe usuário com esse e-mail na empresa
  const existing = await prisma.user.findFirst({
    where: { email, companyId: session.user.companyId },
  });

  if (existing) {
    return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
  }

  // Cria ou reutiliza convite pendente
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.invite.create({
    data: {
      email,
      role,
      expiresAt,
      companyId: session.user.companyId,
    },
  });

  // Envia e-mail de convite
  await sendInviteEmail({
    to: email,
    companyName: session.user.companyName,
    inviteToken: invite.token,
    inviterName: session.user.name || "Admin",
  });

  return NextResponse.json({ message: "Convite enviado!", inviteId: invite.id }, { status: 201 });
}
