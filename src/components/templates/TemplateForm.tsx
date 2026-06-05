"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

type Template = {
  id: string;
  name: string;
  title: string;
  description: string | null;
  priority: string;
};

export default function TemplateForm({ template }: { template?: Template }) {
  const router = useRouter();
  const isEdit = !!template;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: template?.name || "",
    title: template?.title || "",
    description: template?.description || "",
    priority: template?.priority || "MEDIUM",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/templates/${template!.id}` : "/api/templates";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao salvar template."); setLoading(false); return; }
    router.push("/templates");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Deletar este template?")) return;
    setLoading(true);
    const res = await fetch(`/api/templates/${template!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/templates");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="label" htmlFor="name">Nome do Template *</label>
            <input id="name" name="name" type="text" className="input"
              placeholder="Ex: Criação de Campanha" value={form.name} onChange={handleChange} required />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Nome interno para identificar o template</span>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="title">Título da Tarefa *</label>
            <input id="title" name="title" type="text" className="input"
              placeholder="Ex: Criar criativos para campanha de {cliente}" value={form.title} onChange={handleChange} required />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Título que será pré-preenchido ao criar a tarefa</span>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="description">Descrição padrão</label>
            <textarea id="description" name="description" className="input"
              placeholder="Descreva o que deve ser feito nesta tarefa..." value={form.description} onChange={handleChange} rows={4} />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="priority">Prioridade padrão</label>
            <select id="priority" name="priority" className="select" value={form.priority} onChange={handleChange}>
              <option value="LOW">🟢 Baixa</option>
              <option value="MEDIUM">🟡 Média</option>
              <option value="HIGH">🟠 Alta</option>
              <option value="URGENT">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/templates" className="btn btn-secondary"><ArrowLeft size={15} /> Cancelar</Link>
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                Deletar
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
            {isEdit ? "Salvar alterações" : "Criar Template"}
          </button>
        </div>
      </div>
    </form>
  );
}
