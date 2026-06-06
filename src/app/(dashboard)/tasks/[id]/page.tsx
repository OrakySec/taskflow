import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TaskDetail from "@/components/tasks/TaskDetail";
import type { Metadata } from "next";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: task?.title ?? "Tarefa" };
}

export default async function TaskDetailPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, companyId: session.user.companyId },
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      client: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, avatar: true } },
      template: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      },
      attachments: { orderBy: { createdAt: "desc" } },
      history: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });

  if (!task) notFound();

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  if (!isAdmin && task.assignedToId !== session.user.id) {
    redirect("/tasks");
  }

  // Busca usuários da empresa para @menção
  const companyUsers = await prisma.user.findMany({
    where: { companyId: session.user.companyId, isActive: true },
    select: { id: true, name: true, avatar: true },
    orderBy: { name: "asc" },
  });

  return (
    <TaskDetail
      task={task}
      currentUserId={session.user.id}
      currentUserName={session.user.name || ""}
      currentUserAvatar={session.user.avatar}
      isAdmin={isAdmin}
      companyUsers={companyUsers}
    />
  );
}
