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

      <div className="card" style={{ padding: "32px" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="label" htmlFor="companyName">
              Nome da Empresa
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className="input"
              placeholder="Minha Agência de Tráfego"
              value={form.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="name">
              Seu Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="João Silva"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password">
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px", marginTop: "4px" }}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Criando conta...
              </>
            ) : (
              "Criar Conta Grátis"
            )}
          </button>
        </form>
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
