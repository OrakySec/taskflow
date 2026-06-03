"use client";

import Link from "next/link";
import {
  MessageSquare,
  Paperclip,
  Clock,
  User,
  Briefcase,
  CheckSquare,
} from "lucide-react";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatRelativeTime,
  isOverdue,
} from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "DONE" | "FAILED";
  deadline: Date | null;
  createdAt: Date;
  assignedTo: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
  _count: { comments: number; attachments: number };
}

interface TaskListProps {
  tasks: Task[];
  isAdmin: boolean;
}

export default function TaskList({ tasks, isAdmin }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <CheckSquare size={28} />
        </div>
        <p style={{ fontSize: "15px", fontWeight: "500", marginBottom: "6px", color: "var(--text-secondary)" }}>
          Nenhuma tarefa encontrada
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Tente ajustar os filtros ou crie uma nova tarefa.
        </p>
        {isAdmin && (
          <Link href="/tasks/new" className="btn btn-primary btn-sm" style={{ marginTop: "16px" }}>
            Nova Tarefa
          </Link>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {tasks.map((task) => {
        const overdue =
          task.deadline &&
          isOverdue(task.deadline) &&
          task.status !== "DONE" &&
          task.status !== "FAILED";

        return (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            style={{ textDecoration: "none" }}
          >
            <div className={`task-card task-card-${task.priority.toLowerCase()}`}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.title}
                  </div>

                  {task.description && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        marginBottom: "10px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.description}
                    </div>
                  )}

                  {/* Meta row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className={`badge priority-${task.priority}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                    <span className={`badge status-${task.status}`}>
                      {STATUS_LABELS[task.status]}
                    </span>

                    {task.assignedTo && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <User size={11} />
                        {task.assignedTo.name}
                      </span>
                    )}

                    {task.client && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Briefcase size={11} />
                        {task.client.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                >
                  {/* Counters */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    {task._count.comments > 0 && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <MessageSquare size={12} />
                        {task._count.comments}
                      </span>
                    )}
                    {task._count.attachments > 0 && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Paperclip size={12} />
                        {task._count.attachments}
                      </span>
                    )}
                  </div>

                  {/* Deadline */}
                  {task.deadline && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: overdue ? "var(--red)" : "var(--text-muted)",
                        fontWeight: overdue ? "600" : "400",
                      }}
                    >
                      <Clock size={11} />
                      {overdue ? "Atrasada! " : ""}
                      {formatRelativeTime(task.deadline)}
                    </span>
                  )}

                  {/* Created at */}
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {formatRelativeTime(task.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
