"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="nav-item" style={{ width: "100%", justifyContent: "space-between", background: "transparent" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "16px", height: "16px", opacity: 0.5 }} /> Tema
        </div>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      className="nav-item"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{ width: "100%", justifyContent: "space-between", background: "transparent", border: "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        {isDark ? "Modo Claro" : "Modo Escuro"}
      </div>
      <div
        style={{
          width: "36px",
          height: "20px",
          borderRadius: "10px",
          background: isDark ? "var(--accent)" : "var(--bg-secondary)",
          border: "1px solid var(--border)",
          position: "relative",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: isDark ? "18px" : "2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "white",
            transition: "all 0.3s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </button>
  );
}
