import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, CheckSquare, Plus, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Super Admin — Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const [totalCompanies, totalUsers, totalTasks, recentCompanies] = await Promise.all([
    prisma.company.count(),
    prisma.user.count({ where: { role: { not: "SUPER_ADMIN" as never } } }),
    prisma.task.count(),
    prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: { select: { users: true, tasks: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Empresas", value: totalCompanies, icon: Building2, color: "#7c3aed", href: "/admin/companies" },
    { label: "Usuários", value: totalUsers, icon: Users, color: "#2563eb", href: "/admin/companies" },
    { label: "Tarefas", value: totalTasks, icon: CheckSquare, color: "#059669", href: "/admin/companies" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "6px" }}>
          Painel de Controle
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Visão geral de todos os clientes do TaskFlow
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: "20px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>{stat.label}</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `${stat.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <div style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-primary)" }}>{stat.value}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Companies */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={18} style={{ color: "var(--accent)" }} />
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              Empresas Recentes
            </h2>
          </div>
          <Link href="/admin/companies/new" className="btn btn-primary" style={{ fontSize: "12px", padding: "6px 14px" }}>
            <Plus size={13} /> Nova Empresa
          </Link>
        </div>

        {recentCompanies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "14px" }}>
            Nenhuma empresa cadastrada ainda.{" "}
            <Link href="/admin/companies/new" style={{ color: "var(--accent-hover)" }}>Criar a primeira</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentCompanies.map((company) => (
              <Link key={company.id} href={`/admin/companies/${company.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "12px 16px", borderRadius: "10px",
                  background: "var(--bg-primary)", border: "1px solid var(--border)",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "9px",
                    background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "700", color: "var(--accent-hover)", flexShrink: 0,
                  }}>
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{company.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>slug: {company.slug}</div>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={12} /> {company._count.users}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckSquare size={12} /> {company._count.tasks}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
