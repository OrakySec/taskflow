import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateClientSchema = z.object({
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type Params = Promise<{ id: string }>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: { id, companyId: session.user.companyId },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, phone, notes } = parsed.data;

    // Se estiver atualizando o e-mail, verificar se já não existe outro cliente/usuário
    if (email && email !== client.email) {
      const existingClient = await prisma.client.findFirst({
        where: { email, companyId: session.user.companyId, id: { not: id } }
      });
      if (existingClient) {
        return NextResponse.json({ error: "Este e-mail já está sendo usado por outro cliente." }, { status: 400 });
      }

      // Se houver um usuário portal vinculado, também deve atualizar o e-mail lá
      const user = await prisma.user.findFirst({
        where: { clientId: id }
      });

      if (user) {
        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (existingUser && existingUser.id !== user.id) {
          return NextResponse.json({ error: "Este e-mail já está sendo usado por um usuário." }, { status: 400 });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { email }
        });
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
