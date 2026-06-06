"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
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
          Bem-vindo de volta! Acesse sua conta.
        </p>
      </div>

      {/* Card de login */}
      <div
        className="card"
        style={{ padding: "32px" }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password">Senha</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
            <div style={{ textAlign: "right", marginTop: "4px" }}>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "12px",
                  color: "var(--accent-hover)",
                  textDecoration: "none",
                }}
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "12px" }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Entrando...
              </>
            ) : (
              "Entrar"
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
        Novo por aqui?{" "}
        <Link
          href="/register"
          style={{ color: "var(--accent-hover)", textDecoration: "none", fontWeight: "500" }}
        >
          Criar conta gratuita
        </Link>
      </p>
    </div>
  );
}
