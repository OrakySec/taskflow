import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditTaskForm from "@/components/tasks/EditTaskForm";

type Params = Promise<{ id: string }>;

export default async function EditTaskPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdmin) redirect("/tasks"); // Only admin/managers can edit tasks completely

  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, companyId: session.user.companyId },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      deadline: true,
      assignedToId: true,
      clientId: true,
    },
  });

  if (!task) redirect("/tasks");

  const [users, clients] = await Promise.all([
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
  ]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
          }}
        >
          Editar Tarefa
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Altere os detalhes da tarefa.
        </p>
      </div>

      <EditTaskForm
        task={{
          ...task,
          priority: task.priority as string,
        }}
        users={users}
        clients={clients}
      />
    </div>
  );
}
