import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata: Metadata = {
  title: "Calendário | TaskFlow",
  description: "Visão geral de prazos e entregas",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  // Buscar tarefas que possuem deadline
  const tasks = await prisma.task.findMany({
    where: {
      companyId: session.user.companyId,
      deadline: { not: null },
      ...(isAdmin ? {} : { assignedToId: session.user.id })
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      deadline: true,
    },
    orderBy: {
      deadline: "asc"
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Calendário</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Acompanhe os prazos de todas as tarefas cadastradas.
        </p>
      </div>

      <CalendarView tasks={tasks} />
    </div>
  );
}
