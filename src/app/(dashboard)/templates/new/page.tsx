import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TemplateForm from "@/components/templates/TemplateForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Novo Template" };

export default async function NewTemplatePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") redirect("/templates");
  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Novo Template</h1>
        <p className="page-subtitle">Crie um modelo de tarefa para reutilizar rapidamente.</p>
      </div>
      <TemplateForm />
    </div>
  );
}
