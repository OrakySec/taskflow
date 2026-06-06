import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Mail, Phone, Calendar, CheckSquare, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ClientAccessManager from "@/components/clients/ClientAccessManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalhes do Cliente" };

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const resolvedParams = await params;
  const clientId = resolvedParams.id;

  const client = await prisma.client.findFirst({
    where: { id: clientId, companyId: session.user.companyId },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          assignedTo: { select: { name: true } }
        }
      }
    }
  });

  if (!client) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Cliente não encontrado</h2>
        <Link href="/clients" className="btn btn-primary" style={{ marginTop: "16px" }}>Voltar para Clientes</Link>
      </div>
    );
  }

  const clientUser = await prisma.user.findFirst({
    where: { clientId: client.id, companyId: session.user.companyId }
  });

  const openTasks = client.tasks.filter(t => t.status !== "DONE" && t.status !== "FAILED");
  const completedTasks = client.tasks.filter(t => t.status === "DONE");

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/clients" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "14px", textDecoration: "none", marginBottom: "16px" }}>
          <ArrowLeft size={16} /> Voltar para Clientes
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "700", color: "var(--accent-hover)", flexShrink: 0 }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
                {client.name}
                {!client.isActive && <span className="badge" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)", borderColor: "var(--border)", fontSize: "12px" }}>Inativo</span>}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Briefcase size={14} /> Cliente</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> Desde {formatDate(client.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>Informações de Contato</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><Mail size={14} /> E-mail</div>
                <div style={{ fontSize: "14px", color: client.email ? "var(--text-primary)" : "var(--text-muted)" }}>{client.email || "Não informado"}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><Phone size={14} /> Telefone</div>
                <div style={{ fontSize: "14px", color: client.phone ? "var(--text-primary)" : "var(--text-muted)" }}>{client.phone || "Não informado"}</div>
              </div>
              {client.notes && (
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Observações</div>
                  <div style={{ fontSize: "14px", color: "var(--text-primary)", whiteSpace: "pre-wrap", background: "var(--bg-secondary)", padding: "12px", borderRadius: "8px" }}>{client.notes}</div>
                </div>
              )}
            </div>
          </div>

          <ClientAccessManager clientId={client.id} clientEmail={client.email} hasAccess={!!clientUser} />
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--text-primary)", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>Resumo de Tarefas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", fontSize: "14px" }}>
                <Clock size={16} color="var(--blue)" /> Tarefas em andamento
              </div>
              <span style={{ fontSize: "18px", fontWeight: "700" }}>{openTasks.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", fontSize: "14px" }}>
                <CheckSquare size={16} color="var(--green)" /> Tarefas concluídas
              </div>
              <span style={{ fontSize: "18px", fontWeight: "700" }}>{completedTasks.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", fontSize: "14px" }}>
                <Briefcase size={16} color="var(--text-muted)" /> Total de tarefas
              </div>
              <span style={{ fontSize: "18px", fontWeight: "700" }}>{client.tasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>Últimas Tarefas</h3>
          <Link href={`/dashboard?client=${client.id}`} className="btn btn-secondary btn-sm">Ver no Kanban</Link>
        </div>
        
        {client.tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: "14px" }}>
            Nenhuma tarefa vinculada a este cliente ainda.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {client.tasks.slice(0, 5).map(task => (
              <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>{task.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Criada em {formatDate(task.createdAt)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`status-${task.status}`} style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "100px", fontWeight: "600" }}>
                    {task.status}
                  </span>
                  {task.assignedTo && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Resp: {task.assignedTo.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {client.tasks.length > 5 && (
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <Link href={`/dashboard?client=${client.id}`} style={{ fontSize: "13px", color: "var(--accent)", textDecoration: "none" }}>Ver todas as {client.tasks.length} tarefas</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
