"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AcceptInviteForm({ token, email, companyName }: { token: string; email: string; companyName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name: form.name, password: form.password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao aceitar convite."); setLoading(false); return; }
    router.push("/login?invited=1");
  }

  return (
    <div className="card" style={{ padding: "28px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="label">E-mail</label>
          <input type="email" className="input" value={email} disabled style={{ opacity: 0.6 }} />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="invite-name">Seu Nome *</label>
          <input id="invite-name" type="text" className="input" placeholder="João Silva" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="invite-pwd">Criar Senha *</label>
          <div style={{ position: "relative" }}>
            <input id="invite-pwd" type={showPwd ? "text" : "password"} className="input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} style={{ paddingRight: "44px" }} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "12px", marginTop: "4px" }}>
          {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : null}
          Entrar na {companyName}
        </button>
      </form>
    </div>
  );
}
