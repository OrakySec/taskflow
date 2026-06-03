import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase, CheckSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  const clients = await prisma.client.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clients.length} cliente{clients.length !== 1 ? "s" : ""} cadastrado{clients.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Link href="/clients/new" className="btn btn-primary">
            <Plus size={16} /> Novo Cliente
          </Link>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Briefcase size={28} /></div>
          <p style={{ fontSize: "15px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>Nenhum cliente ainda</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Cadastre seus clientes para vincular às tarefas.</p>
          {isAdmin && <Link href="/clients/new" className="btn btn-primary btn-sm" style={{ marginTop: "16px" }}>Adicionar Cliente</Link>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: "20px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "var(--accent-hover)", flexShrink: 0 }}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
                    {client.email && <div style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.email}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <CheckSquare size={12} />
                  {client._count.tasks} tarefa{client._count.tasks !== 1 ? "s" : ""}
                  {!client.isActive && <span className="badge" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)", borderColor: "var(--border)", marginLeft: "auto" }}>Inativo</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
