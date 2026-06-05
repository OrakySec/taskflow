"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDate, getInitials, PRIORITY_LABELS } from "@/lib/utils";
import { Clock, MessageSquare, Paperclip } from "lucide-react";
import Link from "next/link";
import type { TaskPriority, TaskStatus } from "@prisma/client";

interface KanbanCardProps {
  task: {
    id: string;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline: Date | null;
    createdAt: Date;
    client: { name: string } | null;
    assignedTo: { id: string; name: string } | null;
    _count: { comments: number; attachments: number };
  };
}

export default function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card ${isDragging ? "ring-2 ring-indigo-500 shadow-xl" : ""}`}
      style={{
        padding: "16px",
        cursor: "grab",
        marginBottom: "12px",
        position: "relative",
        borderLeft: `3px solid var(--${
          task.priority === "URGENT" ? "red" :
          task.priority === "HIGH" ? "orange" :
          task.priority === "MEDIUM" ? "yellow" : "green"
        })`,
        ...style
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <span className={`badge priority-${task.priority}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.client && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task.client.name}
          </span>
        )}
      </div>

      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "12px", lineHeight: "1.4" }}>
        {task.title}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "12px" }}>
          {task.deadline && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className={isOverdue ? "overdue" : ""}>
              <Clock size={12} /> {formatDate(task.deadline)}
            </div>
          )}
          {(task._count.comments > 0 || task._count.attachments > 0) && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {task._count.comments > 0 && <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><MessageSquare size={12} /> {task._count.comments}</span>}
              {task._count.attachments > 0 && <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Paperclip size={12} /> {task._count.attachments}</span>}
            </div>
          )}
        </div>

        {task.assignedTo ? (
          <div className="avatar avatar-sm" title={task.assignedTo.name}>
            {getInitials(task.assignedTo.name)}
          </div>
        ) : (
          <div className="avatar avatar-sm" style={{ background: "transparent", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
            ?
          </div>
        )}
      </div>

      <Link 
        href={`/tasks/${task.id}`} 
        onClick={(e) => e.stopPropagation()} 
        style={{ position: "absolute", inset: 0, opacity: 0 }} 
        aria-label="Ver detalhes"
      />
    </div>
  );
}
