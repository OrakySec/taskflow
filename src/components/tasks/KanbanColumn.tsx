"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import { Inbox } from "lucide-react";

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
    id: TaskStatus | string;
    title: string;
  };
  tasks: Task[];
  readonly?: boolean;
}

export default function KanbanColumn({ column, tasks, readonly = false }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    disabled: readonly,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div 
      className={`flex flex-col bg-slate-50/40 dark:bg-white/[0.02] backdrop-blur-md rounded-2xl min-w-[320px] max-w-[320px] h-full max-h-[calc(100vh-200px)] border transition-colors duration-300 overflow-hidden shadow-sm relative ${
        isOver ? "border-indigo-500/50 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-slate-200/60 dark:border-white/10"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.01] pointer-events-none" />
      
      <div className="p-4 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between bg-white/60 dark:bg-[#111116]/60 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)] ${
              column.id === "DONE" ? "bg-emerald-500 shadow-emerald-500/50" :
              column.id === "FAILED" ? "bg-red-500 shadow-red-500/50" :
              column.id === "IN_PROGRESS" ? "bg-blue-500 shadow-blue-500/50" : "bg-slate-400 shadow-slate-400/50"
            }`}
          />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            {column.title}
          </h3>
        </div>
        <span className="badge bg-slate-200/50 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-none px-2.5 py-1 text-xs font-bold rounded-lg">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col relative z-10"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} readonly={readonly} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 select-none pointer-events-none min-h-[150px] transition-opacity duration-300">
            <div className={`w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center mb-3 ${isOver ? 'border-indigo-500 text-indigo-500 bg-indigo-500/10' : 'border-slate-400 dark:border-slate-500 text-slate-400 dark:text-slate-500'}`}>
              <Inbox size={24} />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isOver ? "Solte a tarefa aqui" : "Nenhuma tarefa"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
