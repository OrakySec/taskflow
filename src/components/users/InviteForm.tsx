"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import CustomSelect, { SelectItem } from "@/components/ui/CustomSelect";

export default function InviteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", role: "COLLABORATOR" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao enviar convite."); setLoading(false); return; }
    setInviteToken(data.token);
    setLoading(false);
  }

  if (inviteToken) {
    const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <CheckCircle size={48} color="var(--green)" style={{ marginBottom: "16px" }} />
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>Convite gerado!</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>Tentamos enviar um e-mail para <strong style={{ color: "var(--text-secondary)" }}>{form.email}</strong>.</p>
        
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
          <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "8px" }}>Caso o e-mail não chegue, copie o link abaixo e envie para a pessoa:</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="text" readOnly value={inviteUrl} className="input" style={{ flex: 1, fontFamily: "monospace", fontSize: "12px", background: "var(--bg-primary)" }} />
            <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(inviteUrl)}>Copiar</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn btn-secondary" onClick={() => { setInviteToken(""); setForm({ email: "", role: "COLLABORATOR" }); }}>Enviar outro</button>
          <Link href="/users" className="btn btn-primary">Ver equipe</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="label" htmlFor="email">E-mail do colaborador *</label>
            <input id="email" type="email" className="input" placeholder="colaborador@email.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="role">Nível de acesso</label>
            <CustomSelect 
              id="role"
              value={form.role} 
              onChange={(val) => setForm(p => ({ ...p, role: val }))}
              items={[
                { value: "COLLABORATOR", label: "Colaborador — pode ver e executar tarefas próprias" },
                { value: "MANAGER", label: "Gerente — pode criar e gerenciar tarefas" },
                { value: "ADMIN", label: "Administrador — acesso total" }
              ]}
            />
          </div>
          <div className="alert alert-info" style={{ fontSize: "12px" }}>O colaborador receberá um e-mail com link para criar sua conta. O convite expira em 7 dias.</div>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <Link href="/users" className="btn btn-secondary"><ArrowLeft size={15} /> Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Enviar Convite
          </button>
        </div>
      </div>
    </form>
  );
}
