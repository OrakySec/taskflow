import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewClientForm from "@/components/clients/NewClientForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Novo Cliente" };

export default async function NewClientPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdmin) redirect("/clients");
  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Novo Cliente</h1>
        <p className="page-subtitle">Cadastre um novo cliente para vincular às tarefas.</p>
      </div>
      <NewClientForm />
    </div>
  );
}
