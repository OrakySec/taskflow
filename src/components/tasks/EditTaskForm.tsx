"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CustomSelect, { SelectItem } from "@/components/ui/CustomSelect";
import { getInitials, getAvatarColor } from "@/lib/utils";

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

  const assigneeItems: SelectItem[] = [
    { value: "", label: "Sem responsável" },
  ];
  if (teams.length > 0) {
    assigneeItems.push({
      label: "Equipes (Squads)",
      options: teams.map((t) => ({
        value: `team_${t.id}`,
        label: t.name,
        avatar: getInitials(t.name),
        avatarColor: getAvatarColor(t.name),
      })),
    });
  }
  if (users.length > 0) {
    assigneeItems.push({
      label: "Membros Individuais",
      options: users.map((u) => ({
        value: u.id,
        label: u.name,
        avatar: getInitials(u.name),
        avatarColor: getAvatarColor(u.name),
      })),
    });
  }

  const statusItems: SelectItem[] = [
    { value: "OPEN", label: "Aberta" },
    { value: "IN_PROGRESS", label: "Em andamento" },
    { value: "DONE", label: "Concluída" },
  ];

  const priorityItems: SelectItem[] = [
    { value: "LOW", label: "🟢 Baixa" },
    { value: "MEDIUM", label: "🟡 Média" },
    { value: "HIGH", label: "🟠 Alta" },
    { value: "URGENT", label: "🔴 Urgente" },
  ];

  const clientItems: SelectItem[] = [
    { value: "", label: "Sem cliente" },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

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

          {/* Status + Priority row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="label" htmlFor="status">
                Status *
              </label>
              <CustomSelect
                id="status"
                name="status"
                value={form.status}
                onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                items={statusItems}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="priority">
                Prioridade *
              </label>
              <CustomSelect
                id="priority"
                name="priority"
                value={form.priority}
                onChange={(value) => setForm((prev) => ({ ...prev, priority: value }))}
                items={priorityItems}
              />
            </div>
          </div>

          {/* Deadline + Client row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
            <div className="form-group">
              <label className="label" htmlFor="clientId">
                Cliente
              </label>
              <CustomSelect
                id="clientId"
                name="clientId"
                value={form.clientId}
                onChange={(value) => setForm((prev) => ({ ...prev, clientId: value }))}
                items={clientItems}
              />
            </div>
          </div>

          {/* Assigned To row */}
          <div className="form-group">
            <label className="label" htmlFor="assignedToId">
              Responsável
            </label>
            <CustomSelect
              id="assignedToId"
              name="assignedToId"
              value={form.assignedToId}
              onChange={(value) => setForm((prev) => ({ ...prev, assignedToId: value }))}
              items={assigneeItems}
            />
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
