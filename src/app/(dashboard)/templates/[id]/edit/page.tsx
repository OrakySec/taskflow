import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TemplateForm from "@/components/templates/TemplateForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar Template" };

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") redirect("/templates");

  const { id } = await params;
  const template = await prisma.taskTemplate.findFirst({
    where: { id, companyId: session.user.companyId },
  });

  if (!template) notFound();

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Editar Template</h1>
        <p className="page-subtitle">Atualize o modelo de tarefa.</p>
      </div>
      <TemplateForm template={template} />
    </div>
  );
}
