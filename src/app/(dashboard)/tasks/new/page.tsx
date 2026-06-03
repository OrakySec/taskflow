import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewTaskForm from "@/components/tasks/NewTaskForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nova Tarefa" };

export default async function NewTaskPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdmin) redirect("/tasks");

  const [users, clients, templates] = await Promise.all([
    prisma.user.findMany({
      where: { companyId: session.user.companyId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      where: { companyId: session.user.companyId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.taskTemplate.findMany({
      where: { companyId: session.user.companyId },
      select: { id: true, name: true, title: true, description: true, priority: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Nova Tarefa</h1>
        <p className="page-subtitle">Preencha os dados da tarefa abaixo.</p>
      </div>
      <NewTaskForm users={users} clients={clients} templates={templates} />
    </div>
  );
}
