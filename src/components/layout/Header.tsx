"use client";

import { useSession } from "next-auth/react";
import { Bell, Menu } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="app-header">
      {/* Mobile menu button */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ display: "none", marginRight: "8px" }}
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      {title && (
        <h1
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "var(--text-primary)",
            letterSpacing: "-0.2px",
          }}
        >
          {title}
        </h1>
      )}

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Notifications */}
        <Link
          href="/notifications"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          title="Notificações"
        >
          <Bell size={16} />
          {/* Notification dot — will be dynamic later */}
          <span className="notification-dot" />
        </Link>

        {/* Avatar */}
        <div
          className="avatar"
          style={{ cursor: "default" }}
          title={user?.name || ""}
        >
          {user?.name ? getInitials(user.name) : "?"}
        </div>
      </div>
    </header>
  );
}
