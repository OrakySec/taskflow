"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, EyeOff, UserPlus, KeyRound, RefreshCw } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "COLLABORATOR", label: "Colaborador", description: "Acessa e conclui tarefas atribuídas a ele" },
  { value: "MANAGER", label: "Gerente", description: "Cria e gerencia tarefas, acessa relatórios" },
  { value: "ADMIN", label: "Administrador", description: "Acesso total: usuários, configurações e dados" },
];

function generatePassword(length = 12): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export default function CreateUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "COLLABORATOR",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleGeneratePassword() {
    const pwd = generatePassword();
    setForm((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao criar usuário.");
      setLoading(false);
      return;
    }

    setSuccess(`Usuário "${data.user.name}" criado com sucesso! Guarde a senha informada para repassar a ele.`);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "12px 16px", color: "#22c55e", fontSize: "14px" }}>
              <span>{success}</span>
            </div>
          )}

          {/* Nome */}
          <div className="form-group">
            <label className="label" htmlFor="name">Nome Completo *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              placeholder="Ex: João Silva"
              value={form.name}
              onChange={handleChange}
              required
              disabled={!!success}
            />
          </div>

          {/* E-mail */}
          <div className="form-group">
            <label className="label" htmlFor="email">E-mail *</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="joao@empresa.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={!!success}
            />
          </div>

          {/* Senha */}
          <div className="form-group">
            <label className="label" htmlFor="password">Senha Inicial *</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={!!success}
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="btn btn-secondary"
                title="Gerar senha aleatória segura"
                disabled={!!success}
                style={{ flexShrink: 0, gap: "6px" }}
              >
                <RefreshCw size={14} />
                Gerar
              </button>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              O usuário poderá alterar a senha depois no próprio perfil.
            </span>
          </div>

          {/* Perfil */}
          <div className="form-group">
            <label className="label">Perfil de Acesso *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${form.role === opt.value ? "var(--accent)" : "var(--border)"}`,
                    background: form.role === opt.value ? "var(--accent-subtle)" : "var(--bg-secondary)",
                    cursor: success ? "default" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={form.role === opt.value}
                    onChange={handleChange}
                    disabled={!!success}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{opt.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          {success ? (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => { setSuccess(""); setForm({ name: "", email: "", password: "", role: "COLLABORATOR" }); }}>
                <UserPlus size={15} /> Criar Outro
              </button>
              <Link href="/users" className="btn btn-primary">
                Ver Equipe
              </Link>
            </>
          ) : (
            <>
              <Link href="/users" className="btn btn-secondary">
                <ArrowLeft size={15} /> Cancelar
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Criando...</> : <><KeyRound size={15} /> Criar Usuário</>}
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
