import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(6),
});

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, segmentData: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id: clientId } = await segmentData.params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Senha inválida (mínimo 6 caracteres)" }, { status: 400 });
  }

  const { password } = parsed.data;

  try {
    const client = await prisma.client.findFirst({
      where: { id: clientId, companyId: session.user.companyId },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (!client.email) {
      return NextResponse.json({ error: "O cliente precisa ter um e-mail cadastrado" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    // Verifica se já existe um usuário para este cliente
    const existingUser = await prisma.user.findFirst({
      where: { clientId: client.id, companyId: session.user.companyId }
    });

    if (existingUser) {
      // Atualiza a senha
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
    } else {
      // Verifica se o e-mail já existe globalmente na empresa (para evitar colisão de login)
      const emailConflict = await prisma.user.findFirst({
        where: { email: client.email }
      });

      if (emailConflict) {
        return NextResponse.json({ error: "Este e-mail já está sendo usado por outro usuário." }, { status: 400 });
      }

      // Cria o novo acesso
      await prisma.user.create({
        data: {
          name: client.name,
          email: client.email,
          password: hashedPassword,
          role: "CLIENT",
          companyId: session.user.companyId,
          clientId: client.id,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao configurar acesso" }, { status: 500 });
  }
}
