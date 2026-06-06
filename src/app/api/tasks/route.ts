import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendNotification, sendPersonalNotification } from "@/lib/notifications";
import {
  buildTaskCreatedMessage,
} from "@/lib/whatsapp";

const createTaskSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assignedToId: z.string().optional().nullable(),
  assignedTeamId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  attachments: z.array(z.object({
    filename: z.string(),
    fileUrl: z.string(),
    fileSize: z.number(),
    mimeType: z.string()
  })).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assignedTo = searchParams.get("assignedTo");
  const clientId = searchParams.get("clientId");

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  };

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  
  if (!isAdmin) {
    const userWithTeams = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teams: { select: { id: true } } }
    });
    const teamIds = userWithTeams?.teams.map(t => t.id) || [];
    
    // Removendo a atribuição direta e usando OR para incluir time
    delete where.assignedToId;
    
    // Se assignedTo veio no filtro da URL, sobrescreve tudo
    if (assignedTo) {
      where.assignedToId = assignedTo;
    } else {
      where.OR = [
        { assignedToId: session.user.id },
        { assignedTeamId: { in: teamIds } }
      ];
    }
  } else {
    if (assignedTo) where.assignedToId = assignedTo;
  }
  
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (clientId) where.clientId = clientId;

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ priority: "desc" }, { deadline: "asc" }, { createdAt: "desc" }],
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      assignedTeam: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
      _count: { select: { comments: true, attachments: true } },
    },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  const isClient = session.user.role === "CLIENT";
  
  // Clients can create tasks (requests), collaborators currently cannot unless changed.
  // We'll allow ADMIN, MANAGER, and CLIENT.
  if (!isAdmin && !isClient) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let userClientId = data.clientId || null;
    let taskStatus = "OPEN";
    
    // Se for cliente criando, força o clientId dele e o status DRAFT
    if (isClient) {
      const userObj = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!userObj || !userObj.clientId) {
        return NextResponse.json({ error: "Cliente não configurado no perfil." }, { status: 400 });
      }
      userClientId = userObj.clientId;
      taskStatus = "DRAFT";
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: taskStatus as any,
        assignedToId: isClient ? null : (data.assignedToId || null),
        assignedTeamId: isClient ? null : (data.assignedTeamId || null),
        clientId: userClientId,
        deadline: data.deadline ? new Date(data.deadline) : null,
        templateId: data.templateId || null,
        companyId: session.user.companyId,
        createdById: session.user.id,
        attachments: data.attachments?.length ? {
          create: data.attachments
        } : undefined
      },
      include: {
        assignedTo: { select: { name: true } },
        assignedTeam: { select: { name: true } },
        client: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    // Audit log
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        userId: session.user.id,
        action: "CREATED",
        newValue: task.title,
      },
    });

    // Notificação interna para o responsável (individual)
    if (task.assignedToId && task.assignedToId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          type: "TASK_ASSIGNED",
          title: "Nova tarefa atribuída",
          body: `Você foi designado para: ${task.title}`,
          link: `/tasks/${task.id}`,
        },
      });
    }

    // Notificação interna para a equipe
    if (task.assignedTeamId) {
      const teamWithMembers = await prisma.team.findUnique({
        where: { id: task.assignedTeamId },
        include: { members: { select: { id: true } } }
      });
      if (teamWithMembers) {
        const notificationsToCreate = teamWithMembers.members
          .filter(m => m.id !== session.user.id)
          .map(m => ({
            userId: m.id,
            type: "TASK_ASSIGNED" as any,
            title: "Nova tarefa para equipe",
            body: `A equipe ${task.assignedTeam?.name} recebeu: ${task.title}`,
            link: `/tasks/${task.id}`,
          }));
        
        if (notificationsToCreate.length > 0) {
          await prisma.notification.createMany({ data: notificationsToCreate });
        }
      }
    }

    // Notificação externa (WhatsApp + Telegram)
    const message = buildTaskCreatedMessage({
      title: task.title,
      priority: task.priority,
      assignedTo: task.assignedTeam ? `Equipe ${task.assignedTeam.name}` : task.assignedTo?.name,
      client: task.client?.name,
      deadline: task.deadline,
      createdBy: task.createdBy.name,
    });

    if (isClient) {
      const managers = await prisma.user.findMany({
        where: {
          companyId: session.user.companyId,
          role: { in: ["ADMIN", "MANAGER"] },
          isActive: true
        }
      });
      for (const manager of managers) {
        sendPersonalNotification(session.user.companyId, manager, message, false).catch(console.error);
      }
    } else {
      sendNotification(session.user.companyId, message).catch(console.error);
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
