"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
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
            <input id="email" name="email" type="email" className="input" placeholder="contato@cliente.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="phone">Telefone</label>
            <input id="phone" name="phone" type="text" className="input" placeholder="(11) 99999-9999" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="notes">Observações</label>
            <textarea id="notes" name="notes" className="input" placeholder="Informações adicionais sobre este cliente..." value={form.notes} onChange={handleChange} rows={3} />
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
