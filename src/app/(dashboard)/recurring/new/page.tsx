import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RecurringForm from "@/components/recurring/RecurringForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nova Tarefa Recorrente" };

export default async function NewRecurringPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") redirect("/recurring");

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
    <div style={{ maxWidth: "640px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Nova Tarefa Recorrente</h1>
        <p className="page-subtitle">Configure uma tarefa que será criada automaticamente no período definido.</p>
      </div>
      <RecurringForm users={users} clients={clients} />
    </div>
  );
}
