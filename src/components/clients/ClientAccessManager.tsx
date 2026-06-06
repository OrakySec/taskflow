"use client";

import { useState } from "react";
import { Key, Shield, ShieldAlert, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientAccessManager({ 
  clientId, 
  clientEmail, 
  hasAccess 
}: { 
  clientId: string; 
  clientEmail: string | null; 
  hasAccess: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleSaveAccess(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!clientEmail) {
      setError("O cliente precisa ter um e-mail cadastrado.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/clients/${clientId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Erro ao configurar acesso.");
      } else {
        setMessage(hasAccess ? "Senha redefinida com sucesso!" : "Acesso criado com sucesso!");
        setPassword("");
        setShowForm(false);
        router.refresh();
      }
    } catch (err) {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: "20px", marginTop: "24px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Key size={18} /> Acesso ao Portal do Cliente
      </h3>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {hasAccess ? (
            <>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--status-done-bg)", color: "var(--status-done-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={18} />
              </div>
              <div>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Acesso Ativo</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>O cliente pode acessar o portal via e-mail.</p>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-secondary)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldAlert size={18} />
              </div>
              <div>
                <p style={{ fontWeight: "600", fontSize: "14px" }}>Sem Acesso</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>O cliente não possui login no portal.</p>
              </div>
            </>
          )}
        </div>

        {!showForm && (
          <button 
            className={`btn ${hasAccess ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={() => setShowForm(true)}
            disabled={!clientEmail}
            title={!clientEmail ? "Edite o cliente e adicione um e-mail primeiro" : ""}
          >
            {hasAccess ? "Redefinir Senha" : "Criar Acesso"}
          </button>
        )}
      </div>

      {!clientEmail && !hasAccess && (
        <div className="alert alert-warning" style={{ marginTop: "16px", fontSize: "13px", padding: "10px" }}>
          Este cliente não possui e-mail cadastrado. Não é possível criar um acesso.
        </div>
      )}

      {message && (
        <div className="alert alert-success" style={{ marginTop: "16px", fontSize: "13px", padding: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Check size={14} /> {message}
        </div>
      )}

      {showForm && clientEmail && (
        <form onSubmit={handleSaveAccess} style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)", animation: "fadeIn 0.2s" }}>
          {error && <div className="alert alert-error" style={{ marginBottom: "16px", fontSize: "13px", padding: "10px" }}>{error}</div>}
          
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="label">E-mail de Login</label>
            <input type="text" className="input" value={clientEmail} disabled style={{ background: "var(--bg-secondary)", opacity: 0.7 }} />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="label">Nova Senha</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Mínimo 6 caracteres" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Salvar Acesso
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
