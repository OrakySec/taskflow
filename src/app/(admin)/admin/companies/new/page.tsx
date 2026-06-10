import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewCompanyForm from "@/components/admin/NewCompanyForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nova Empresa — Super Admin" };

export default async function NewCompanyPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div style={{ maxWidth: "580px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "6px" }}>
          Cadastrar Nova Empresa
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Crie uma nova empresa no sistema e defina o usuário administrador dela.
        </p>
      </div>
      <NewCompanyForm />
    </div>
  );
}
