"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Briefcase,
  LayoutTemplate,
  RefreshCw,
  Settings,
  LogOut,
  Zap,
  Bell,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/clients", label: "Clientes", icon: Briefcase },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/recurring", label: "Recorrentes", icon: RefreshCw },
  { href: "/users", label: "Equipe", icon: Users },
];

const bottomItems = [
  { href: "/settings", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <aside className="app-sidebar">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "16px 12px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 4px 24px",
            borderBottom: "1px solid var(--border)",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "var(--accent)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 14px var(--accent-glow)",
              flexShrink: 0,
            }}
          >
            <Zap size={18} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text-primary)",
                letterSpacing: "-0.3px",
              }}
            >
              TaskFlow
            </div>
            {user?.companyName && (
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  maxWidth: "140px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.companyName}
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <ThemeToggle />
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {/* User info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 8px",
              marginTop: "4px",
              borderRadius: "8px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="avatar avatar-sm">
              {user?.name ? getInitials(user.name) : "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.role === "ADMIN"
                  ? "Admin"
                  : user?.role === "MANAGER"
                  ? "Gerente"
                  : "Colaborador"}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sair"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
                padding: "4px",
                borderRadius: "4px",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--red)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
