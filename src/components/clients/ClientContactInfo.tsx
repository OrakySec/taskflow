"use client";

import { useState } from "react";
import { Mail, Phone, Edit2, CheckCircle, X, Loader2 } from "lucide-react";

type ClientContactInfoProps = {
  client: {
    id: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
  };
};

export default function ClientContactInfo({ client }: ClientContactInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [email, setEmail] = useState(client.email || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [notes, setNotes] = useState(client.notes || "");

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar informações");
      }

      setIsEditing(false);
      window.location.reload(); // Reload to update other parts of the UI if needed
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>Informações de Contato</h3>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Edit2 size={14} /> Editar
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm" disabled={loading}>
              <X size={14} /> Cancelar
            </button>
            <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Salvar
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Mail size={14} /> E-mail
          </div>
          {isEditing ? (
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
          ) : (
            <div style={{ fontSize: "14px", color: client.email ? "var(--text-primary)" : "var(--text-muted)" }}>{client.email || "Não informado"}</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Phone size={14} /> Telefone
          </div>
          {isEditing ? (
            <input type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          ) : (
            <div style={{ fontSize: "14px", color: client.phone ? "var(--text-primary)" : "var(--text-muted)" }}>{client.phone || "Não informado"}</div>
          )}
        </div>
        {(isEditing || client.notes) && (
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Observações</div>
            {isEditing ? (
              <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anotações adicionais..." />
            ) : (
              <div style={{ fontSize: "14px", color: "var(--text-primary)", whiteSpace: "pre-wrap", background: "var(--bg-secondary)", padding: "12px", borderRadius: "8px" }}>{client.notes}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
