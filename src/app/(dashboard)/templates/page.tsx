import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutTemplate, CheckSquare } from "lucide-react";
import type { Metadata } from "next";
import { PRIORITY_LABELS, getPriorityClass } from "@/lib/utils";

export const metadata: Metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  const templates = await prisma.taskTemplate.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle">{templates.length} template{templates.length !== 1 ? "s" : ""} cadastrado{templates.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Link href="/templates/new" className="btn btn-primary">
            <Plus size={16} /> Novo Template
          </Link>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><LayoutTemplate size={28} /></div>
          <p style={{ fontSize: "15px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>Nenhum template ainda</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Templates agilizam a criação de tarefas repetitivas.</p>
          {isAdmin && <Link href="/templates/new" className="btn btn-primary btn-sm" style={{ marginTop: "16px" }}>Criar Template</Link>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {templates.map((template) => (
            <div key={template.id} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <LayoutTemplate size={16} color="var(--accent-hover)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px" }}>{template.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{template.title}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  <span className={`badge ${getPriorityClass(template.priority)}`}>{PRIORITY_LABELS[template.priority]}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                    <CheckSquare size={12} /> {template._count.tasks} uso{template._count.tasks !== 1 ? "s" : ""}
                  </div>
                  {isAdmin && (
                    <Link href={`/templates/${template.id}/edit`} className="btn btn-secondary btn-sm">Editar</Link>
                  )}
                </div>
              </div>
              {template.description && (
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)", paddingLeft: "52px" }}>
                  {template.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
