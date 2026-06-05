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
      {...attributes}
      {...listeners}
      className={`card glass-panel-hover relative cursor-grab mb-3 flex flex-col border-l-[3px] ${
        task.priority === "URGENT" ? "border-l-red-500" :
        task.priority === "HIGH" ? "border-l-orange-500" :
        task.priority === "MEDIUM" ? "border-l-amber-500" : "border-l-emerald-500"
      } ${isDragging ? "ring-2 ring-indigo-500 shadow-xl opacity-40" : "opacity-100"}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`badge priority-${task.priority}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.client && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[100px] truncate">
            {task.client.name}
          </span>
        )}
      </div>

      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3 leading-snug">
        {task.title}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {task.deadline && (
            <div className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
              <Clock size={12} /> {formatDate(task.deadline)}
            </div>
          )}
          {(task._count.comments > 0 || task._count.attachments > 0) && (
            <div className="flex items-center gap-1.5">
              {task._count.comments > 0 && <span className="flex items-center gap-0.5"><MessageSquare size={12} /> {task._count.comments}</span>}
              {task._count.attachments > 0 && <span className="flex items-center gap-0.5"><Paperclip size={12} /> {task._count.attachments}</span>}
            </div>
          )}
        </div>

        {task.assignedTo ? (
          <div className="avatar avatar-sm ring-2 ring-white dark:ring-[#161925]" title={task.assignedTo.name}>
            {getInitials(task.assignedTo.name)}
          </div>
        ) : (
          <div className="avatar avatar-sm bg-transparent border border-dashed border-slate-300 dark:border-slate-600 text-slate-400" title="Não atribuído">
            ?
          </div>
        )}
      </div>

      <Link 
        href={`/tasks/${task.id}`} 
        onClick={(e) => e.stopPropagation()} 
        className="absolute inset-0 opacity-0"
        aria-label="Ver detalhes"
      />
    </div>
  );
}
