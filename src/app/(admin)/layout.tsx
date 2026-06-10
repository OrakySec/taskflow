import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, LogOut, Zap, Shield } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside style={{
        width: "240px",
        flexShrink: 0,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg, #7c3aed, #db2777)",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(124,58,237,0.4)",
            }}>
              <Zap size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>TaskFlow</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#a78bfa", fontWeight: "600" }}>
                <Shield size={9} /> SUPER ADMIN
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.15s" }}
            className="admin-nav-link">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link href="/admin/companies" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.15s" }}
            className="admin-nav-link">
            <Building2 size={16} /> Empresas
          </Link>
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
          <div style={{ padding: "10px 12px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
            Logado como<br />
            <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{session.user.name}</span>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button type="submit" style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}>
              <LogOut size={15} /> Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px", maxWidth: "1200px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
