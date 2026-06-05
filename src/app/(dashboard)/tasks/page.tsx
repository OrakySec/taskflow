import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Filter,
} from "lucide-react";
import type { Metadata } from "next";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskFilters from "@/components/tasks/TaskFilters";
import type { TaskStatus, TaskPriority } from "@prisma/client";

export const metadata: Metadata = { title: "Tarefas" };

interface PageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assignedTo?: string;
    clientId?: string;
    q?: string;
  }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  const where: Record<string, unknown> = {
    companyId: session.user.companyId,
  };

  // Colaborador só vê suas tarefas
  if (!isAdmin) {
    where.assignedToId = session.user.id;
  }

  if (params.status) where.status = params.status as TaskStatus;
  if (params.priority) where.priority = params.priority as TaskPriority;
  if (params.assignedTo) where.assignedToId = params.assignedTo;
  if (params.clientId) where.clientId = params.clientId;
  if (params.q) {
    where.title = { contains: params.q, mode: "insensitive" };
  }

  const [tasks, users, clients] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { deadline: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        assignedTo: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    isAdmin
      ? prisma.user.findMany({
          where: { companyId: session.user.companyId, isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [],
    prisma.client.findMany({
      where: { companyId: session.user.companyId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      {/* Header */}
      <div
        className="flex-col-mobile"
        style={{
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 className="page-title">Tarefas</h1>
          <p className="page-subtitle">
            {tasks.length} tarefa{tasks.length !== 1 ? "s" : ""} encontrada
            {tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Link href="/tasks/new" className="btn btn-primary w-full-mobile" style={{ justifyContent: "center" }}>
            <Plus size={16} />
            Nova Tarefa
          </Link>
        )}
      </div>

      {/* Filters */}
      <TaskFilters
        users={users}
        clients={clients}
        currentParams={params}
        isAdmin={isAdmin}
      />

      {/* Task Kanban Board */}
      <div style={{ flex: 1, minHeight: 0, height: "calc(100vh - 200px)" }}>
        <KanbanBoard initialTasks={tasks as any} />
      </div>
    </div>
  );
}
