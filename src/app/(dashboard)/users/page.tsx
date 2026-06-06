import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus, CheckSquare, Shield, Users } from "lucide-react";
import { formatDate, getInitials, ROLE_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Equipe" };

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, avatar: true, _count: { select: { assignedTasks: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Equipe</h1>
          <p className="page-subtitle">{users.length} membro{users.length !== 1 ? "s" : ""} na equipe</p>
        </div>
        <Link href="/users/invite" className="btn btn-primary"><UserPlus size={16} /> Convidar</Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {users.map((user) => (
          <div key={user.id} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="avatar overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{user.name}</span>
                  {!user.isActive && <span className="badge" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)", borderColor: "var(--border)", fontSize: "11px" }}>Inativo</span>}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <CheckSquare size={12} /> {user._count.assignedTasks}
                </div>
                <span className={`badge ${user.role === "ADMIN" ? "priority-URGENT" : user.role === "MANAGER" ? "priority-HIGH" : "status-OPEN"}`} style={{ fontSize: "11px" }}>
                  <Shield size={10} /> {ROLE_LABELS[user.role]}
                </span>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>desde {formatDate(user.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
