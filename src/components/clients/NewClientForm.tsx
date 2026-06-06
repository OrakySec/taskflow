"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Key } from "lucide-react";

export default function NewClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    notes: "",
    createPortalAccess: false,
    password: ""
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.createPortalAccess && (!form.email || form.password.length < 6)) {
      setError("Para criar acesso, informe um e-mail válido e uma senha de no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao criar cliente."); setLoading(false); return; }
    router.push("/clients");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="label" htmlFor="name">Nome do Cliente *</label>
            <input id="name" name="name" type="text" className="input" placeholder="Ex: Loja do João" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" className="input" placeholder="contato@cliente.com" value={form.email} onChange={handleChange} required={form.createPortalAccess} />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="phone">Telefone</label>
            <input id="phone" name="phone" type="text" className="input" placeholder="(11) 99999-9999" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="notes">Observações</label>
            <textarea id="notes" name="notes" className="input" placeholder="Informações adicionais sobre este cliente..." value={form.notes} onChange={handleChange} rows={3} />
          </div>

          <div style={{ marginTop: "8px", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "500", fontSize: "14px", color: "var(--text-primary)" }}>
              <input 
                type="checkbox" 
                name="createPortalAccess"
                checked={form.createPortalAccess}
                onChange={handleChange}
                style={{ width: "16px", height: "16px", accentColor: "var(--accent-primary)" }}
              />
              <Key size={16} style={{ color: "var(--text-muted)" }} />
              Criar acesso ao Portal do Cliente
            </label>
            
            {form.createPortalAccess && (
              <div style={{ marginTop: "16px", animation: "fadeIn 0.2s ease-in-out" }}>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: "1.5" }}>
                  O cliente fará login usando o <strong>e-mail</strong> cadastrado acima e a senha abaixo.
                </p>
                <div className="form-group">
                  <label className="label" htmlFor="password">Senha de Acesso *</label>
                  <input 
                    id="password" 
                    name="password" 
                    type="text" 
                    className="input" 
                    placeholder="Mínimo 6 caracteres" 
                    value={form.password} 
                    onChange={handleChange} 
                    required={form.createPortalAccess}
                    minLength={6}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <Link href="/clients" className="btn btn-secondary"><ArrowLeft size={15} /> Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Salvar Cliente
          </button>
        </div>
      </div>
    </form>
  );
}
