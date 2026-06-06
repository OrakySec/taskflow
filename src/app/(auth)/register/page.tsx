"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao criar conta.");
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "var(--accent)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
          >
            <Zap size={22} color="white" />
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            TaskFlow
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Crie sua conta e comece a organizar sua equipe.
        </p>
      </div>

      <div className="card" style={{ padding: "32px", textAlign: "center" }}>
        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "48px" }}>🔒</span>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>
          Criação de Contas Desativada
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
          No momento, o sistema é restrito apenas para convidados e uso interno. A criação de novas contas públicas está temporariamente suspensa.
        </p>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "14px",
          color: "var(--text-muted)",
        }}
      >
        Já tem uma conta?{" "}
        <Link
          href="/login"
          style={{
            color: "var(--accent-hover)",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
