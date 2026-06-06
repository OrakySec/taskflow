import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Nome muito curto").optional(),
  phone: z.string().optional().nullable(),
  notifyWhatsapp: z.boolean().optional(),
  notifyTelegram: z.boolean().optional(),
  avatar: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, notifyWhatsapp, notifyTelegram, avatar } = parsed.data;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(notifyWhatsapp !== undefined && { notifyWhatsapp }),
        ...(notifyTelegram !== undefined && { notifyTelegram }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar perfil" }, { status: 500 });
  }
}
