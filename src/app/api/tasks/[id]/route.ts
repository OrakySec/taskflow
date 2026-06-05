import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendNotification } from "@/lib/notifications";
import {
  buildTaskStatusChangedMessage,
} from "@/lib/whatsapp";

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "FAILED"]).optional(),
  assignedToId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  failureReason: z.string().optional().nullable(),
});

type Params = Promise<{ id: string }>;

async function getTaskOrFail(taskId: string, companyId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, companyId },
  });
  return task;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, companyId: session.user.companyId },
    include: {
      assignedTo: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      template: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true } },
        },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      history: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

  // Colaborador só pode ver tarefa atribuída a ele
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdmin && task.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const task = await getTaskOrFail(id, session.user.companyId);
  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  // Colaborador só pode mudar status de tarefas atribuídas a ele
  if (!isAdmin && task.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const historyEntries: { action: string; oldValue?: string; newValue?: string }[] = [];

    // Track status change
    if (data.status && data.status !== task.status) {
      historyEntries.push({
        action: "STATUS_CHANGED",
        oldValue: task.status,
        newValue: data.status,
      });
    }

    // Track priority change
    if (data.priority && data.priority !== task.priority) {
      historyEntries.push({
        action: "PRIORITY_CHANGED",
        oldValue: task.priority,
        newValue: data.priority,
      });
    }

    // Track assignment change
    if ("assignedToId" in data && data.assignedToId !== task.assignedToId) {
      historyEntries.push({
        action: "ASSIGNED",
        oldValue: task.assignedToId || undefined,
        newValue: data.assignedToId || undefined,
      });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...data };
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (data.deadline === null) updateData.deadline = null;
    delete updateData.failureReason;

    // Handle status transitions
    if (data.status === "IN_PROGRESS" && !task.startedAt) {
      updateData.startedAt = new Date();
    }
    if (data.status === "DONE" || data.status === "FAILED") {
      updateData.completedAt = new Date();
    }

    // Store failure reason as a comment
    if (data.status === "FAILED" && data.failureReason) {
      await prisma.taskComment.create({
        data: {
          taskId: id,
          authorId: session.user.id,
          content: `❌ **Motivo da falha:** ${data.failureReason}`,
        },
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { name: true } },
        client: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    // Save audit history
    if (historyEntries.length > 0) {
      await prisma.taskHistory.createMany({
        data: historyEntries.map((entry) => ({
          taskId: id,
          userId: session.user.id,
          action: entry.action,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
        })),
      });
    }

    // Notify on status change
    if (data.status && data.status !== task.status) {
      const statusLabels: Record<string, string> = {
        OPEN: "Aberta",
        IN_PROGRESS: "Em Andamento",
        DONE: "Concluída",
        FAILED: "Falhou",
      };

      // Internal notification to task creator
      if (task.createdById !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: task.createdById,
            type: "TASK_STATUS_CHANGED",
            title: `Tarefa ${statusLabels[data.status]}`,
            body: `"${task.title}" foi marcada como ${statusLabels[data.status]}`,
            link: `/tasks/${id}`,
          },
        });
      }

      // External notification
      const message = buildTaskStatusChangedMessage({
        title: task.title,
        oldStatus: task.status,
        newStatus: data.status,
        changedBy: session.user.name || "Alguém",
        failureReason: data.failureReason,
      });
      sendNotification(session.user.companyId, message).catch(console.error);
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;

  const task = await getTaskOrFail(id, session.user.companyId);
  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ message: "Tarefa excluída" });
}
