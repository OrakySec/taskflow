import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, RefreshCw, Calendar, CalendarDays, Zap, Clock, MoreVertical, Edit2 } from "lucide-react";
import type { Metadata } from "next";
import { PRIORITY_LABELS, getPriorityClass } from "@/lib/utils";

export const metadata: Metadata = { title: "Tarefas Recorrentes" };

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const SHORT_DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function RecurringPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  const recurring = await prisma.recurringTask.findMany({
    where: { companyId: session.user.companyId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: {
      assignedTo: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
    },
  });

  const dailyTasks = recurring.filter((r) => r.frequency === "DAILY");
  const weeklyTasks = recurring.filter((r) => r.frequency === "WEEKLY");
  const monthlyTasks = recurring.filter((r) => r.frequency === "MONTHLY");

  const active = recurring.filter((r) => r.isActive);
  const paused = recurring.filter((r) => !r.isActive);

  // Helper to render a recurring task card
  const renderCard = (task: any) => (
    <div key={task.id} className={`card glass-panel-hover p-4 relative group ${!task.isActive ? "opacity-60 grayscale-[0.5]" : ""}`}>
      <div className="flex justify-between items-start mb-2">
        <div className={`badge ${getPriorityClass(task.priority)}`}>
          {PRIORITY_LABELS[task.priority]}
        </div>
        {isAdmin && (
          <Link href={`/recurring/${task.id}/edit`} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-indigo-500">
            <Edit2 size={14} />
          </Link>
        )}
      </div>
      
      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
        {task.title}
      </h4>
      
      <div className="flex flex-col gap-1.5 mt-3">
        {task.client && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <BriefcaseIcon size={12} />
            <span className="truncate">{task.client.name}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <UserIcon size={12} />
            <span className="truncate max-w-[120px]">{task.assignedTo?.name || "Sem responsável"}</span>
          </div>
          {!task.isActive && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-sm">
              Pausada
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <RefreshCw className="text-indigo-500" size={28} />
            Rotinas & Recorrências
          </h1>
          <p className="page-subtitle mt-1">
            {active.length} rotina{active.length !== 1 ? "s" : ""} ativa{active.length !== 1 ? "s" : ""}
            {paused.length > 0 ? ` · ${paused.length} pausada${paused.length !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        {isAdmin && (
          <Link href="/recurring/new" className="btn btn-primary shadow-lg shadow-indigo-500/20">
            <Plus size={16} /> Nova Rotina
          </Link>
        )}
      </div>

      {recurring.length === 0 ? (
        <div className="empty-state border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0c]/50 backdrop-blur-xl">
          <div className="empty-state-icon bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500"><RefreshCw size={28} /></div>
          <p className="text-base font-semibold text-slate-900 dark:text-white mt-4 mb-1">Nenhuma rotina configurada</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">Tarefas recorrentes geram novas tarefas automaticamente nos dias programados, poupando seu tempo.</p>
          {isAdmin && (
            <Link href="/recurring/new" className="btn btn-primary mt-6 shadow-md shadow-indigo-500/20">
              Criar Primeira Rotina
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-10 pb-10">
          
          {/* SEMANAL KANBAN */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="text-indigo-500" size={20} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Semanal</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {DAY_NAMES.map((dayName, index) => {
                const tasksForDay = weeklyTasks.filter(t => t.daysOfWeek?.split(',').includes(index.toString()));
                return (
                  <div key={dayName} className="min-w-[280px] max-w-[280px] flex-shrink-0 flex flex-col bg-slate-100/50 dark:bg-[#0a0a0c]/40 rounded-2xl border border-slate-200/50 dark:border-white/5 snap-start">
                    <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-white/5 rounded-t-2xl backdrop-blur-md">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-200">{dayName}</h3>
                      <span className="text-xs font-bold bg-white dark:bg-[#15151a] text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full shadow-sm">
                        {tasksForDay.length}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-3 min-h-[150px]">
                      {tasksForDay.map(renderCard)}
                      {tasksForDay.length === 0 && (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-600 font-medium italic border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                          Livre
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* MENSAL KANBAN */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-500" size={20} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Mensal</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                const tasksForDay = monthlyTasks.filter(t => t.dayOfMonth === day);
                // Highlight days that have tasks to make navigation easier, but show all days
                const hasTasks = tasksForDay.length > 0;
                
                return (
                  <div key={day} className={`min-w-[260px] max-w-[260px] flex-shrink-0 flex flex-col rounded-2xl border snap-start transition-colors ${hasTasks ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-500/20' : 'bg-slate-100/30 dark:bg-[#0a0a0c]/20 border-slate-200/30 dark:border-white/5'}`}>
                    <div className={`p-3 border-b flex items-center justify-between rounded-t-2xl backdrop-blur-md ${hasTasks ? 'bg-blue-100/50 dark:bg-blue-500/10 border-blue-200/50 dark:border-blue-500/20' : 'bg-white/30 dark:bg-white/5 border-slate-200/50 dark:border-white/5'}`}>
                      <h3 className={`font-bold flex items-center gap-1.5 ${hasTasks ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        Dia {day}
                      </h3>
                      {hasTasks && (
                        <span className="text-xs font-bold bg-white dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full shadow-sm">
                          {tasksForDay.length}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-3 min-h-[100px]">
                      {tasksForDay.map(renderCard)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* DIÁRIA KANBAN (GRID) */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-amber-500" size={20} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Todos os dias</h2>
            </div>
            {dailyTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-100/50 dark:bg-[#0a0a0c]/40 rounded-2xl border border-slate-200/50 dark:border-white/5">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma rotina diária configurada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dailyTasks.map(renderCard)}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}

// Simple icons for the cards since we can't import everything inline easily without clutter
function BriefcaseIcon({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}

function UserIcon({ size }: { size: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

