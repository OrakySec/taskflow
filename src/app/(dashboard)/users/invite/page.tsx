import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import InviteForm from "@/components/users/InviteForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Convidar Colaborador" };

export default async function InvitePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/users");
  return (
    <div style={{ maxWidth: "500px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Convidar Colaborador</h1>
        <p className="page-subtitle">Envie um convite por e-mail para um novo membro da equipe.</p>
      </div>
      <InviteForm />
    </div>
  );
}
