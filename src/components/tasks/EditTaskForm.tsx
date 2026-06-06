"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditTaskFormProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    deadline: Date | null;
    assignedToId: string | null;
    assignedTeamId?: string | null;
    clientId: string | null;
  };
  users: { id: string; name: string }[];
  teams?: { id: string; name: string }[];
  clients: { id: string; name: string }[];
}

export default function EditTaskForm({ task, users, teams = [], clients }: EditTaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    assignedToId: task.assignedTeamId ? `team_${task.assignedTeamId}` : (task.assignedToId || ""),
    clientId: task.clientId || "",
    deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isTeam = form.assignedToId?.startsWith("team_");
    const assignedTeamId = isTeam ? form.assignedToId.replace("team_", "") : null;
    const assignedUserId = !isTeam && form.assignedToId ? form.assignedToId : null;

    const body = {
      ...form,
      assignedToId: assignedUserId,
      assignedTeamId,
      clientId: form.clientId || null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao editar tarefa.");
      setLoading(false);
      return;
    }

    router.push(`/tasks/${task.id}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* Title */}
          <div className="form-group">
            <label className="label" htmlFor="title">
              Título *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="input"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label" htmlFor="description">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              className="input"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Priority + Deadline row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="label" htmlFor="priority">
                Prioridade *
              </label>
              <select
                id="priority"
                name="priority"
                className="select"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="LOW">🟢 Baixa</option>
                <option value="MEDIUM">🟡 Média</option>
                <option value="HIGH">🟠 Alta</option>
                <option value="URGENT">🔴 Urgente</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="deadline">
                Prazo
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                className="input"
                value={form.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Assigned to + Client */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="label" htmlFor="assignedToId">
                Responsável
              </label>
              <select
                id="assignedToId"
                name="assignedToId"
                className="select"
                value={form.assignedToId}
                onChange={handleChange}
              >
                <option value="">Sem responsável</option>
                {teams.length > 0 && (
                  <optgroup label="Equipes (Squads)">
                    {teams.map((t) => (
                      <option key={t.id} value={`team_${t.id}`}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {users.length > 0 && (
                  <optgroup label="Membros Individuais">
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="clientId">
                Cliente
              </label>
              <select
                id="clientId"
                name="clientId"
                className="select"
                value={form.clientId}
                onChange={handleChange}
              >
                <option value="">Sem cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "28px",
            paddingTop: "20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <Link href={`/tasks/${task.id}`} className="btn btn-secondary">
            <ArrowLeft size={15} />
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                Salvando...
              </>
            ) : (
              "Salvar Edição"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
