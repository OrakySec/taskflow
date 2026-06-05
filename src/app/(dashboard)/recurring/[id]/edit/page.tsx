import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import RecurringForm from "@/components/recurring/RecurringForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar Tarefa Recorrente" };

export default async function EditRecurringPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") redirect("/recurring");

  const { id } = await params;

  const [recurring, users, clients] = await Promise.all([
    prisma.recurringTask.findFirst({
      where: { id, companyId: session.user.companyId },
    }),
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

  if (!recurring) notFound();

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Editar Recorrente</h1>
        <p className="page-subtitle">Atualize as configurações desta tarefa recorrente.</p>
      </div>
      <RecurringForm recurring={recurring} users={users} clients={clients} />
    </div>
  );
}
