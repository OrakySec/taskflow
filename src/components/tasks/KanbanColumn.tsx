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
    <div className="flex flex-col bg-slate-50/50 dark:bg-white/5 backdrop-blur-md rounded-2xl min-w-[300px] max-w-[300px] h-full max-h-[calc(100vh-200px)] border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between bg-white/60 dark:bg-[#111116]/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              column.id === "DONE" ? "bg-emerald-500" :
              column.id === "FAILED" ? "bg-red-500" :
              column.id === "IN_PROGRESS" ? "bg-blue-500" : "bg-slate-400"
            }`}
          />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {column.title}
          </h3>
        </div>
        <span className="badge bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 border-none px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col"
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
