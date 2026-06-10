import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, CheckSquare, Plus, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Empresas — Super Admin" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function AdminCompaniesPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, tasks: true } },
    },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
            Empresas Cadastradas
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {companies.length} empresa{companies.length !== 1 ? "s" : ""} no sistema
          </p>
        </div>
        <Link href="/admin/companies/new" className="btn btn-primary">
          <Plus size={15} /> Nova Empresa
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <Building2 size={40} style={{ color: "var(--text-muted)", margin: "0 auto 16px" }} />
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "8px" }}>Nenhuma empresa cadastrada</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>Crie a primeira empresa para começar a usar o TaskFlow.</p>
          <Link href="/admin/companies/new" className="btn btn-primary">
            <Plus size={14} /> Criar Primeira Empresa
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {companies.map((company) => (
            <Link key={company.id} href={`/admin/companies/${company.id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: "18px 22px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* Avatar */}
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "11px",
                    background: "var(--accent-subtle)", border: "1px solid var(--accent-glow)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", fontWeight: "800", color: "var(--accent-hover)", flexShrink: 0,
                  }}>
                    {company.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "2px" }}>{company.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>/{company.slug}</div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "var(--text-muted)", flexShrink: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Users size={13} /> {company._count.users} usuário{company._count.users !== 1 ? "s" : ""}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <CheckSquare size={13} /> {company._count.tasks} tarefa{company._count.tasks !== 1 ? "s" : ""}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Calendar size={13} /> {formatDate(company.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
