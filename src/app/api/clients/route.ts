import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hash } from "bcryptjs";

const schema = z.object({
  name: z.string().min(2),
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  phone: z.union([z.string(), z.literal(""), z.null()]).optional(),
  notes: z.union([z.string(), z.literal(""), z.null()]).optional(),
  createPortalAccess: z.boolean().optional(),
  password: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { createPortalAccess, password, ...clientData } = parsed.data;

  if (createPortalAccess && (!clientData.email || !password || password.length < 6)) {
    return NextResponse.json({ error: "Para criar acesso, informe um e-mail válido e uma senha de no mínimo 6 caracteres." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: { ...clientData, companyId: session.user.companyId },
      });

      if (createPortalAccess && password && clientData.email) {
        // Verifica se o e-mail já existe
        const existingUser = await tx.user.findFirst({ where: { email: clientData.email } });
        if (existingUser) {
          throw new Error("Este e-mail já está sendo usado por outro usuário.");
        }

        const hashedPassword = await hash(password, 12);
        await tx.user.create({
          data: {
            name: clientData.name,
            email: clientData.email,
            password: hashedPassword,
            role: "CLIENT",
            companyId: session.user.companyId,
            clientId: client.id,
          },
        });
      }

      return client;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao processar requisição" }, { status: 500 });
  }
}
