import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import type { Metadata } from "next";
import { PRIORITY_LABELS, getPriorityClass } from "@/lib/utils";

export const metadata: Metadata = { title: "Tarefas Recorrentes" };

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Diária",
  WEEKLY: "Semanal",
  MONTHLY: "Mensal",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatSchedule(r: { frequency: string; daysOfWeek?: string | null; dayOfMonth?: number | null }) {
  if (r.frequency === "DAILY") return "Todo dia";
  if (r.frequency === "WEEKLY" && r.daysOfWeek) {
    const days = r.daysOfWeek.split(",").map((d) => DAY_NAMES[parseInt(d)]);
    return `Toda ${days.join(", ")}`;
  }
  if (r.frequency === "MONTHLY" && r.dayOfMonth) {
    return `Todo dia ${r.dayOfMonth} do mês`;
  }
  return FREQUENCY_LABELS[r.frequency];
}

export default async function RecurringPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  const recurring = await prisma.recurringTask.findMany({
    where: { companyId: session.user.companyId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      assignedTo: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
    },
  });

  const active = recurring.filter((r) => r.isActive);
  const paused = recurring.filter((r) => !r.isActive);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Tarefas Recorrentes</h1>
          <p className="page-subtitle">
            {active.length} ativa{active.length !== 1 ? "s" : ""}
            {paused.length > 0 ? ` · ${paused.length} pausada${paused.length !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        {isAdmin && (
          <Link href="/recurring/new" className="btn btn-primary">
            <Plus size={16} /> Nova Recorrente
          </Link>
        )}
      </div>

      {recurring.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><RefreshCw size={28} /></div>
          <p style={{ fontSize: "15px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>Nenhuma tarefa recorrente</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Tarefas recorrentes são criadas automaticamente no dia programado.</p>
          {isAdmin && (
            <Link href="/recurring/new" className="btn btn-primary btn-sm" style={{ marginTop: "16px" }}>Criar Recorrente</Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {recurring.map((r) => (
            <div key={r.id} className="card" style={{ padding: "18px 20px", opacity: r.isActive ? 1 : 0.55 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: r.isActive ? "var(--accent-subtle)" : "var(--bg-secondary)",
                  border: `1px solid ${r.isActive ? "var(--accent-glow)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <RefreshCw size={16} color={r.isActive ? "var(--accent-hover)" : "var(--text-muted)"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{r.title}</span>
                    {!r.isActive && (
                      <span className="badge" style={{ fontSize: "10px", color: "var(--text-muted)", background: "var(--bg-secondary)", borderColor: "var(--border)" }}>Pausada</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--accent-hover)", fontWeight: "500" }}>{formatSchedule(r)}</span>
                    {r.assignedTo
                      ? <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>→ {r.assignedTo.name}</span>
                      : <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>Sem responsável fixo</span>
                    }
                    {r.client && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>· {r.client.name}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span className={`badge ${getPriorityClass(r.priority)}`}>{PRIORITY_LABELS[r.priority]}</span>
                  {isAdmin && (
                    <Link href={`/recurring/${r.id}/edit`} className="btn btn-secondary btn-sm">Editar</Link>
                  )}
                </div>
              </div>
              {r.description && (
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)", paddingLeft: "52px" }}>
                  {r.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
