import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateUserForm from "@/components/users/CreateUserForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Novo Usuário" };

export default async function NewUserPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/users");

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Criar Novo Usuário</h1>
        <p className="page-subtitle">
          Cadastre um novo membro da equipe diretamente, sem precisar de convite por e-mail.
        </p>
      </div>
      <CreateUserForm />
    </div>
  );
}
