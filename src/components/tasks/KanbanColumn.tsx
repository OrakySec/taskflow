"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";
import type { TaskPriority, TaskStatus } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: Date | null;
  createdAt: Date;
  client: { name: string } | null;
  assignedTo: { id: string; name: string } | null;
  _count: { comments: number; attachments: number };
}

interface KanbanColumnProps {
  column: {
    id: TaskStatus;
    title: string;
  };
  tasks: Task[];
}

export default function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRadius: "12px",
        minWidth: "300px",
        maxWidth: "300px",
        height: "100%",
        maxHeight: "calc(100vh - 200px)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: `var(--${
                column.id === "DONE" ? "green" :
                column.id === "FAILED" ? "red" :
                column.id === "IN_PROGRESS" ? "blue" : "text-muted"
              })`
            }}
          />
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
            {column.title}
          </h3>
        </div>
        <span className="badge" style={{ background: "var(--bg-secondary)" }}>
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          padding: "12px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
