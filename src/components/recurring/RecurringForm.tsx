"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

type User = { id: string; name: string };
type Client = { id: string; name: string };
type Recurring = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  frequency: string;
  daysOfWeek: string | null;
  dayOfMonth: number | null;
  autoAssign: boolean;
  assignedToId: string | null;
  clientId: string | null;
  isActive: boolean;
};

const DAY_OPTIONS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
];

export default function RecurringForm({
  recurring,
  users,
  clients,
}: {
  recurring?: Recurring;
  users: User[];
  clients: Client[];
}) {
  const router = useRouter();
  const isEdit = !!recurring;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: recurring?.title || "",
    description: recurring?.description || "",
    priority: recurring?.priority || "MEDIUM",
    frequency: recurring?.frequency || "WEEKLY",
    daysOfWeek: recurring?.daysOfWeek ? recurring.daysOfWeek.split(",") : ["1"],
    dayOfMonth: recurring?.dayOfMonth?.toString() || "1",
    autoAssign: recurring?.autoAssign ?? false,
    assignedToId: recurring?.assignedToId || "",
    clientId: recurring?.clientId || "",
    isActive: recurring?.isActive ?? true,
  });

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.frequency === "WEEKLY" && form.daysOfWeek.length === 0) {
      setError("Selecione ao menos um dia da semana.");
      return;
    }
    setLoading(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      frequency: form.frequency,
      daysOfWeek: form.frequency === "WEEKLY" ? form.daysOfWeek.join(",") : undefined,
      dayOfMonth: form.frequency === "MONTHLY" ? parseInt(form.dayOfMonth) : undefined,
      autoAssign: form.autoAssign,
      assignedToId: form.autoAssign && form.assignedToId ? form.assignedToId : undefined,
      clientId: form.clientId || undefined,
      isActive: form.isActive,
    };

    const url = isEdit ? `/api/recurring/${recurring!.id}` : "/api/recurring";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erro ao salvar."); setLoading(false); return; }
    router.push("/recurring");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Deletar esta tarefa recorrente?")) return;
    setLoading(true);
    await fetch(`/api/recurring/${recurring!.id}`, { method: "DELETE" });
    router.push("/recurring");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* Título */}
          <div className="form-group">
            <label className="label" htmlFor="title">Título da tarefa *</label>
            <input id="title" name="title" type="text" className="input"
              placeholder="Ex: Verificar backup do servidor"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="label" htmlFor="description">Descrição</label>
            <textarea id="description" className="input" rows={3}
              placeholder="Detalhes do que deve ser feito..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          {/* Prioridade */}
          <div className="form-group">
            <label className="label">Prioridade padrão</label>
            <select className="select" value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
              <option value="LOW">🟢 Baixa</option>
              <option value="MEDIUM">🟡 Média</option>
              <option value="HIGH">🟠 Alta</option>
              <option value="URGENT">🔴 Urgente</option>
            </select>
          </div>

          {/* Frequência */}
          <div className="form-group">
            <label className="label">Frequência *</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["DAILY", "WEEKLY", "MONTHLY"].map((f) => (
                <button key={f} type="button"
                  className={`btn ${form.frequency === f ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setForm((p) => ({ ...p, frequency: f }))}>
                  {f === "DAILY" ? "Diária" : f === "WEEKLY" ? "Semanal" : "Mensal"}
                </button>
              ))}
            </div>
          </div>

          {/* Dias da semana (WEEKLY) */}
          {form.frequency === "WEEKLY" && (
            <div className="form-group">
              <label className="label">Dias da semana *</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {DAY_OPTIONS.map((day) => (
                  <button key={day.value} type="button"
                    className={`btn btn-sm ${form.daysOfWeek.includes(day.value) ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => toggleDay(day.value)}>
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dia do mês (MONTHLY) */}
          {form.frequency === "MONTHLY" && (
            <div className="form-group">
              <label className="label" htmlFor="dayOfMonth">Dia do mês *</label>
              <input id="dayOfMonth" type="number" className="input" min={1} max={28}
                value={form.dayOfMonth}
                onChange={(e) => setForm((p) => ({ ...p, dayOfMonth: e.target.value }))}
                style={{ maxWidth: "120px" }} />
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Máximo dia 28 para evitar conflitos em fevereiro</span>
            </div>
          )}

          {/* Atribuição */}
          <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <label className="label" style={{ marginBottom: "12px" }}>Responsável</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "var(--text-secondary)" }}>
                <input type="radio" name="assignMode" checked={!form.autoAssign}
                  onChange={() => setForm((p) => ({ ...p, autoAssign: false, assignedToId: "" }))} />
                <div>
                  <div style={{ fontWeight: "500" }}>Sem responsável fixo</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>A tarefa fica em aberto até alguém pegar</div>
                </div>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "var(--text-secondary)" }}>
                <input type="radio" name="assignMode" checked={form.autoAssign}
                  onChange={() => setForm((p) => ({ ...p, autoAssign: true }))} />
                <div>
                  <div style={{ fontWeight: "500" }}>Atribuir automaticamente</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sempre atribuir à mesma pessoa</div>
                </div>
              </label>
              {form.autoAssign && (
                <select className="select" value={form.assignedToId}
                  onChange={(e) => setForm((p) => ({ ...p, assignedToId: e.target.value }))}>
                  <option value="">— Selecione o responsável —</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Cliente */}
          {clients.length > 0 && (
            <div className="form-group">
              <label className="label">Cliente (opcional)</label>
              <select className="select" value={form.clientId}
                onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}>
                <option value="">— Nenhum cliente —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Status (só no edit) */}
          {isEdit && (
            <div className="form-group">
              <label className="label">Status</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button"
                  className={`btn ${form.isActive ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setForm((p) => ({ ...p, isActive: true }))}>
                  ✅ Ativa
                </button>
                <button type="button"
                  className={`btn ${!form.isActive ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setForm((p) => ({ ...p, isActive: false }))}>
                  ⏸ Pausada
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/recurring" className="btn btn-secondary"><ArrowLeft size={15} /> Cancelar</Link>
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>Deletar</button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
            {isEdit ? "Salvar alterações" : "Criar Recorrente"}
          </button>
        </div>
      </div>
    </form>
  );
}
