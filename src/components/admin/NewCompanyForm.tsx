"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Building2, User, Mail, KeyRound, RefreshCw, Eye, EyeOff, CheckCircle } from "lucide-react";

function generatePassword(length = 14): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export default function NewCompanyForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ companyName: string; adminEmail: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleGeneratePassword() {
    setForm((prev) => ({ ...prev, adminPassword: generatePassword() }));
    setShowPassword(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao criar empresa.");
      setLoading(false);
      return;
    }

    setSuccess({ companyName: data.companyName, adminEmail: data.adminEmail });
    setLoading(false);
  }

  if (success) {
    return (
      <div className="card" style={{ padding: "32px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle size={28} style={{ color: "#22c55e" }} />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
          Empresa criada com sucesso!
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
          <strong style={{ color: "var(--text-primary)" }}>{success.companyName}</strong> foi criada.<br />
          O admin pode entrar com o e-mail <strong style={{ color: "var(--text-primary)" }}>{success.adminEmail}</strong> e a senha que você definiu.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            onClick={() => { setSuccess(null); setForm({ companyName: "", adminName: "", adminEmail: "", adminPassword: "" }); }}
            className="btn btn-secondary"
          >
            <Building2 size={14} /> Criar Outra
          </button>
          <Link href="/admin/companies" className="btn btn-primary">
            Ver Empresas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {error && <div className="alert alert-error"><span>{error}</span></div>}

          {/* Seção: Empresa */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <Building2 size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dados da Empresa</span>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="companyName">Nome da Empresa *</label>
              <input id="companyName" name="companyName" type="text" className="input" placeholder="Ex: Agência XYZ" value={form.companyName} onChange={handleChange} required />
            </div>
          </div>

          {/* Seção: Admin */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <User size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Usuário Administrador</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="label" htmlFor="adminName">Nome do Administrador *</label>
                <input id="adminName" name="adminName" type="text" className="input" placeholder="Ex: João Silva" value={form.adminName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="adminEmail">
                  <Mail size={12} style={{ display: "inline", marginRight: "4px" }} />
                  E-mail *
                </label>
                <input id="adminEmail" name="adminEmail" type="email" className="input" placeholder="admin@empresa.com" value={form.adminEmail} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="adminPassword">
                  <KeyRound size={12} style={{ display: "inline", marginRight: "4px" }} />
                  Senha Inicial *
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input id="adminPassword" name="adminPassword" type={showPassword ? "text" : "password"} className="input" placeholder="Mínimo 6 caracteres" value={form.adminPassword} onChange={handleChange} required style={{ paddingRight: "44px" }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary" title="Gerar senha segura" style={{ flexShrink: 0 }}>
                    <RefreshCw size={14} /> Gerar
                  </button>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  O admin poderá alterar depois. Guarde essa senha para repassar.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <Link href="/admin/companies" className="btn btn-secondary"><ArrowLeft size={14} /> Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Criando...</> : <><Building2 size={14} /> Criar Empresa</>}
          </button>
        </div>
      </div>
    </form>
  );
}
