"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import CustomSelect, { SelectItem } from "@/components/ui/CustomSelect";
import { getInitials, getAvatarColor } from "@/lib/utils";

interface NewTaskFormProps {
  users: { id: string; name: string }[];
  clients: { id: string; name: string }[];
  templates: {
    id: string;
    name: string;
    title: string;
    description: string | null;
    priority: string;
  }[];
  teams?: { id: string; name: string }[];
}

export default function NewTaskForm({ users, clients, templates, teams = [] }: NewTaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedToId: "",
    clientId: "",
    deadline: "",
    templateId: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function applyTemplate(templateId: string) {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setForm((prev) => ({
      ...prev,
      templateId,
      title: tpl.title,
      description: tpl.description || "",
      priority: tpl.priority,
    }));
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
      templateId: form.templateId || null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao criar tarefa.");
      setLoading(false);
      return;
    }

    router.push(`/tasks/${data.id}`);
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

          {/* Template selector */}
          {templates.length > 0 && (
            <div className="form-group">
              <label className="label">
                <LayoutTemplate size={13} style={{ display: "inline", marginRight: "4px" }} />
                Usar Template (opcional)
              </label>
              <select
                className="select"
                value={form.templateId}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, templateId: e.target.value }));
                  if (e.target.value) applyTemplate(e.target.value);
                }}
              >
                <option value="">Selecionar template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              placeholder="Ex: Subir campanha de remarketing para cliente X"
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
              placeholder="Descreva os detalhes da tarefa, o que precisa ser feito, links relevantes..."
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Priority + Status row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
              <CustomSelect
                id="assignedToId"
                name="assignedToId"
                value={form.assignedToId}
                onChange={(value) => setForm((prev) => ({ ...prev, assignedToId: value }))}
                items={assigneeItems}
              />
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
          <Link href="/tasks" className="btn btn-secondary">
            <ArrowLeft size={15} />
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                Criando...
              </>
            ) : (
              "Criar Tarefa"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
