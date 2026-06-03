import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const config = await prisma.notificationConfig.findUnique({
    where: { companyId: session.user.companyId },
  });

  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();

  const config = await prisma.notificationConfig.upsert({
    where: { companyId: session.user.companyId },
    update: body,
    create: { ...body, companyId: session.user.companyId },
  });

  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  // Endpoint para testar notificação
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    await sendNotification(
      session.user.companyId,
      "✅ *Teste TaskFlow*\n\nNotificações configuradas com sucesso! Você receberá alertas aqui."
    );
    return NextResponse.json({ message: "Mensagem de teste enviada!" });
  } catch {
    return NextResponse.json({ error: "Falha ao enviar. Verifique as configurações." }, { status: 500 });
  }
}
