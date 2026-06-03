"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  User,
  Briefcase,
  Play,
  CheckCircle,
  XCircle,
  Send,
  Paperclip,
  History,
  MessageSquare,
  Loader2,
  AlertTriangle,
  LayoutTemplate,
} from "lucide-react";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  formatDateTime,
  formatRelativeTime,
  isOverdue,
  getInitials,
} from "@/lib/utils";

interface User {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: User;
}

interface Attachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

interface HistoryEntry {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  user: User;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "DONE" | "FAILED";
  deadline: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: User | null;
  client: { id: string; name: string } | null;
  createdBy: User;
  template: { id: string; name: string } | null;
  comments: Comment[];
  attachments: Attachment[];
  history: HistoryEntry[];
}

interface TaskDetailProps {
  task: Task;
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
  companyUsers: User[];
}

const ACTION_LABELS: Record<string, string> = {
  CREATED: "criou a tarefa",
  STATUS_CHANGED: "alterou o status",
  PRIORITY_CHANGED: "alterou a prioridade",
  ASSIGNED: "alterou o responsável",
};

const STATUS_LABELS_PT: Record<string, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em Andamento",
  DONE: "Concluída",
  FAILED: "Falhou",
};

const PRIORITY_LABELS_PT: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

type ActiveTab = "chat" | "history" | "attachments";

export default function TaskDetail({
  task: initialTask,
  currentUserId,
  currentUserName,
  isAdmin,
  companyUsers,
}: TaskDetailProps) {
  const router = useRouter();
  const [task, setTask] = useState(initialTask);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState("");

  const overdue =
    task.deadline &&
    isOverdue(task.deadline) &&
    task.status !== "DONE" &&
    task.status !== "FAILED";

  const canChangeStatus =
    isAdmin || task.assignedTo?.id === currentUserId;

  async function updateStatus(
    status: "IN_PROGRESS" | "DONE" | "FAILED",
    failureReason?: string
  ) {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, failureReason }),
      });

      if (res.ok) {
        router.refresh();
        const updated = await res.json();
        setTask((prev) => ({ ...prev, ...updated }));
      }
    } finally {
      setStatusLoading(false);
      setShowFailModal(false);
      setFailReason("");
    }
  }

  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    // Detecta menções
    const mentionRegex = /@(\w+)/g;
    const mentionedNames = [...comment.matchAll(mentionRegex)].map((m) => m[1]);
    const mentions = companyUsers
      .filter((u) =>
        mentionedNames.some((n) =>
          u.name.toLowerCase().includes(n.toLowerCase())
        )
      )
      .map((u) => u.id);

    setSending(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment, mentions }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setTask((prev) => ({
          ...prev,
          comments: [
            ...prev.comments,
            {
              ...newComment,
              createdAt: new Date(newComment.createdAt),
            },
          ],
        }));
        setComment("");
      }
    } finally {
      setSending(false);
    }
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "chat",
      label: "Chat",
      icon: <MessageSquare size={14} />,
      count: task.comments.length,
    },
    {
      id: "history",
      label: "Histórico",
      icon: <History size={14} />,
      count: task.history.length,
    },
    {
      id: "attachments",
      label: "Anexos",
      icon: <Paperclip size={14} />,
      count: task.attachments.length,
    },
  ];

  return (
    <div>
      {/* Back + title */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/tasks"
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: "12px", paddingLeft: 0 }}
        >
          <ArrowLeft size={14} /> Voltar às tarefas
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--text-primary)",
                letterSpacing: "-0.3px",
                marginBottom: "10px",
              }}
            >
              {task.title}
            </h1>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span className={`badge ${STATUS_COLORS[task.status]}`}>
                {STATUS_LABELS[task.status]}
              </span>
              {overdue && (
                <span
                  className="badge"
                  style={{
                    color: "var(--red)",
                    background: "var(--red-subtle)",
                    borderColor: "rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertTriangle size={11} /> Atrasada
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {canChangeStatus && (
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              {task.status === "OPEN" && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => updateStatus("IN_PROGRESS")}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Play size={14} />
                  )}
                  Iniciar
                </button>
              )}
              {task.status === "IN_PROGRESS" && (
                <>
                  <button
                    className="btn btn-sm"
                    style={{
                      background: "var(--green-subtle)",
                      color: "var(--green)",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                    onClick={() => updateStatus("DONE")}
                    disabled={statusLoading}
                  >
                    {statusLoading ? (
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Concluir
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setShowFailModal(true)}
                    disabled={statusLoading}
                  >
                    <XCircle size={14} />
                    Falhou
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left: Chat/History/Attachments */}
        <div className="card" style={{ padding: "0", overflow: "hidden" }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border)",
              padding: "0 4px",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "14px 16px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--accent-hover)"
                      : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: activeTab === tab.id ? "600" : "400",
                  transition: "all 0.15s",
                  marginBottom: "-1px",
                }}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    style={{
                      background: "var(--accent-subtle)",
                      color: "var(--accent-hover)",
                      borderRadius: "999px",
                      padding: "0 6px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Chat tab */}
          {activeTab === "chat" && (
            <div>
              <div
                style={{
                  padding: "16px",
                  minHeight: "300px",
                  maxHeight: "500px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {task.comments.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "200px",
                      color: "var(--text-muted)",
                      gap: "8px",
                    }}
                  >
                    <MessageSquare size={28} />
                    <span style={{ fontSize: "13px" }}>
                      Nenhum comentário ainda. Seja o primeiro!
                    </span>
                  </div>
                )}
                {task.comments.map((c) => {
                  const isMine = c.author.id === currentUserId;
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexDirection: isMine ? "row-reverse" : "row",
                      }}
                    >
                      <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
                        {getInitials(c.author.name)}
                      </div>
                      <div
                        style={{
                          maxWidth: "75%",
                          background: isMine
                            ? "var(--accent-subtle)"
                            : "var(--bg-secondary)",
                          border: `1px solid ${isMine ? "var(--accent-glow)" : "var(--border)"}`,
                          borderRadius: isMine
                            ? "12px 4px 12px 12px"
                            : "4px 12px 12px 12px",
                          padding: "10px 14px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: isMine
                              ? "var(--accent-hover)"
                              : "var(--text-muted)",
                            marginBottom: "4px",
                            fontWeight: "500",
                          }}
                        >
                          {isMine ? "Você" : c.author.name} ·{" "}
                          {formatRelativeTime(c.createdAt)}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            lineHeight: "1.5",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {c.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comment input */}
              <form
                onSubmit={sendComment}
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <div className="avatar avatar-sm" style={{ flexShrink: 0, marginTop: "2px" }}>
                  {getInitials(currentUserName)}
                </div>
                <input
                  type="text"
                  className="input"
                  placeholder="Escreva um comentário... Use @nome para mencionar"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={sending || !comment.trim()}
                  style={{ flexShrink: 0 }}
                >
                  {sending ? (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            </div>
          )}

          {/* History tab */}
          {activeTab === "history" && (
            <div
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "0",
              }}
            >
              {task.history.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  Sem histórico ainda.
                </div>
              )}
              {task.history.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    paddingBottom: "16px",
                    position: "relative",
                  }}
                >
                  {/* Timeline line */}
                  {i < task.history.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: "28px",
                        bottom: 0,
                        width: "1px",
                        background: "var(--border)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "var(--bg-secondary)",
                      border: "2px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      zIndex: 1,
                    }}
                  >
                    {getInitials(entry.user.name)}
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <strong style={{ color: "var(--text-primary)" }}>
                        {entry.user.name}
                      </strong>{" "}
                      {ACTION_LABELS[entry.action] ?? entry.action}
                      {entry.oldValue && entry.newValue && (
                        <>
                          {" "}
                          de{" "}
                          <span
                            style={{
                              color: "var(--text-muted)",
                              textDecoration: "line-through",
                            }}
                          >
                            {STATUS_LABELS_PT[entry.oldValue] ||
                              PRIORITY_LABELS_PT[entry.oldValue] ||
                              entry.oldValue}
                          </span>{" "}
                          para{" "}
                          <strong style={{ color: "var(--accent-hover)" }}>
                            {STATUS_LABELS_PT[entry.newValue] ||
                              PRIORITY_LABELS_PT[entry.newValue] ||
                              entry.newValue}
                          </strong>
                        </>
                      )}
                    </span>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {formatRelativeTime(entry.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attachments tab */}
          {activeTab === "attachments" && (
            <div style={{ padding: "16px" }}>
              {task.attachments.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  <Paperclip size={28} style={{ marginBottom: "8px", opacity: 0.4 }} />
                  <p>Nenhum anexo ainda.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {task.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        textDecoration: "none",
                        transition: "all 0.15s",
                      }}
                    >
                      <Paperclip size={14} color="var(--accent-hover)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {att.filename}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {(att.fileSize / 1024).toFixed(0)} KB ·{" "}
                          {formatRelativeTime(att.createdAt)}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Task info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Info card */}
          <div className="card" style={{ padding: "20px" }}>
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text-muted)",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Informações
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Status
                </div>
                <span className={`badge status-${task.status}`}>
                  {STATUS_LABELS[task.status]}
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Prioridade
                </div>
                <span className={`badge priority-${task.priority}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>

              {task.assignedTo && (
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Responsável
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div className="avatar avatar-sm">
                      {getInitials(task.assignedTo.name)}
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {task.assignedTo.name}
                    </span>
                  </div>
                </div>
              )}

              {task.client && (
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Cliente
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Briefcase size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {task.client.name}
                    </span>
                  </div>
                </div>
              )}

              {task.deadline && (
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Prazo
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: overdue ? "var(--red)" : "var(--text-secondary)",
                      fontSize: "13px",
                      fontWeight: overdue ? "600" : "400",
                    }}
                  >
                    <Clock size={13} />
                    {formatDateTime(task.deadline)}
                    {overdue && " ⚠️"}
                  </div>
                </div>
              )}

              <hr className="divider" />

              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Criada por
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <User size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {task.createdBy.name}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                  }}
                >
                  {formatRelativeTime(task.createdAt)}
                </div>
              </div>

              {task.template && (
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    Template
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <LayoutTemplate size={13} />
                    {task.template.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="card" style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Descrição
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                }}
              >
                {task.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Failure modal */}
      {showFailModal && (
        <div className="modal-overlay" onClick={() => setShowFailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              Marcar como Falhou
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                marginBottom: "20px",
              }}
            >
              Descreva o motivo da falha para que a equipe entenda o que aconteceu.
            </p>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="label">Motivo da falha</label>
              <textarea
                className="input"
                placeholder="Ex: API do cliente caiu, aguardando retorno do suporte..."
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowFailModal(false);
                  setFailReason("");
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => updateStatus("FAILED", failReason)}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <XCircle size={14} />
                )}
                Confirmar Falha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
