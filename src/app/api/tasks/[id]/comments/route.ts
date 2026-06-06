import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comentário não pode ser vazio"),
  mentions: z.array(z.string()).optional(),
});

type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id: taskId } = await params;

  // Verifica se a tarefa existe e pertence à empresa
  const task = await prisma.task.findFirst({
    where: { id: taskId, companyId: session.user.companyId },
    select: { id: true, title: true, assignedToId: true, createdById: true },
  });

  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, mentions = [] } = parsed.data;

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        authorId: session.user.id,
        content,
        mentions: {
          create: mentions.map((userId) => ({ userId })),
        },
      },
      include: {
        author: { select: { id: true, name: true } },
        mentions: true,
      },
    });

    // Notificações de menção
    if (mentions.length > 0) {
      // Cria a notificação interna para todos mencionados (inclusive o próprio usuário, para testes)
      await prisma.notification.createMany({
        data: mentions
          .map((userId) => ({
            userId,
            type: "TASK_MENTION" as const,
            title: "Você foi mencionado",
            body: `${session.user.name} mencionou você em "${task.title}"`,
            link: `/tasks/${taskId}`,
          })),
      });

      // Busca dados dos usuários para envio externo
      const usersToNotify = await prisma.user.findMany({
        where: { id: { in: mentions } },
        select: { id: true, name: true, phone: true, notifyTelegram: true, notifyWhatsapp: true }
      });

      const { sendPersonalNotification } = await import("@/lib/notifications");

      for (const u of usersToNotify) {
        if (u.notifyTelegram || u.notifyWhatsapp) {
          const msg = `*${session.user.name}* mencionou você na tarefa *${task.title}*.\n\nAcesse: ${process.env.NEXT_PUBLIC_APP_URL}/tasks/${taskId}`;
          await sendPersonalNotification(session.user.companyId, u, msg, false);
        }
      }
    }

    // Notificação para o responsável se não for o autor
    const notifyUsers = new Set([task.assignedToId, task.createdById].filter(Boolean));
    notifyUsers.delete(session.user.id);

    if (notifyUsers.size > 0) {
      await prisma.notification.createMany({
        data: Array.from(notifyUsers).map((userId) => ({
          userId: userId!,
          type: "TASK_COMMENT" as const,
          title: "Novo comentário",
          body: `${session.user.name} comentou em "${task.title}"`,
          link: `/tasks/${taskId}`,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
