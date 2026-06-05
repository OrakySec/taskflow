import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate, formatRelativeTime, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/utils";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Briefcase,
  ArrowRight,
  Zap,
  Activity,
  Star
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData(companyId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [
    totalOpen,
    totalInProgress,
    doneToday,
    overdue,
    totalUsers,
    totalClients,
    recentTasks,
    urgentTasks,
    tasksByUser,
  ] = await Promise.all([
    prisma.task.count({ where: { companyId, status: "OPEN" } }),
    prisma.task.count({ where: { companyId, status: "IN_PROGRESS" } }),
    prisma.task.count({
      where: {
        companyId,
        status: "DONE",
        completedAt: { gte: todayStart },
      },
    }),
    prisma.task.count({
      where: {
        companyId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
        deadline: { lt: now },
      },
    }),
    prisma.user.count({ where: { companyId, isActive: true } }),
    prisma.client.count({ where: { companyId, isActive: true } }),
    prisma.task.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        assignedTo: { select: { name: true } },
        client: { select: { name: true } },
      },
    }),
    prisma.task.findMany({
      where: {
        companyId,
        priority: "URGENT",
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: "DONE",
                completedAt: { gte: weekStart },
              },
            },
          },
        },
      },
      orderBy: {
        assignedTasks: {
          _count: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return {
    stats: { totalOpen, totalInProgress, doneToday, overdue, totalUsers, totalClients },
    recentTasks,
    urgentTasks,
    tasksByUser,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { stats, recentTasks, urgentTasks, tasksByUser } = await getDashboardData(
    session.user.companyId
  );

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="page-title text-3xl">
          Bom dia, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="page-subtitle text-base">
          Aqui está um resumo inteligente do seu fluxo de trabalho hoje.
        </p>
      </div>

      {/* Bento Grid Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card glass-panel-hover group relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 rounded-full pointer-events-none transition-all duration-500 opacity-50 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)" }} />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <CheckSquare size={24} />
            </div>
            <span className="badge bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">Abertas</span>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{stats.totalOpen}</div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 relative z-10">Tarefas esperando início</div>
        </div>

        <div className="card glass-panel-hover group relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 rounded-full pointer-events-none transition-all duration-500 opacity-50 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)" }} />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Clock size={24} />
            </div>
            <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">Ativas</span>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{stats.totalInProgress}</div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 relative z-10">Sendo feitas agora</div>
        </div>

        <div className="card glass-panel-hover group relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 rounded-full pointer-events-none transition-all duration-500 opacity-50 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)" }} />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">Hoje</span>
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{stats.doneToday}</div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 relative z-10">Concluídas hoje</div>
        </div>

        <div className={`card glass-panel-hover group relative overflow-hidden ${stats.overdue > 0 ? "border-red-500/30 dark:border-red-500/30" : ""}`}>
          <div className={`absolute top-[-50px] right-[-50px] w-40 h-40 rounded-full pointer-events-none transition-all duration-500 opacity-50 group-hover:opacity-100`} style={{ background: stats.overdue > 0 ? "radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)" : "radial-gradient(circle, rgba(100, 116, 139, 0.15) 0%, transparent 70%)" }} />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-2xl ${stats.overdue > 0 ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-slate-500/10 text-slate-600 dark:text-slate-400"}`}>
              <AlertTriangle size={24} />
            </div>
            {stats.overdue > 0 && <span className="badge bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 animate-pulse">Atenção</span>}
          </div>
          <div className={`text-4xl font-black tracking-tight relative z-10 ${stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>{stats.overdue}</div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 relative z-10">Tarefas atrasadas</div>
        </div>
      </div>

      {/* Main Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity (Spans 2 cols on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card glass-panel flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Fluxo Recente</h2>
              </div>
              <Link href="/tasks" className="btn btn-ghost btn-sm group">
                Ver Kanban <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <CheckSquare size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Tudo limpo por aqui! ✨</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Nenhuma tarefa foi criada no sistema ainda.</p>
                <Link href="/tasks/new" className="btn btn-primary">
                  Criar Primeira Tarefa
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="group block"
                  >
                    <div className="p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border border-slate-100 hover:border-slate-200 dark:border-white/5 dark:hover:border-white/10 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`badge priority-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
                          <span className={`badge status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                          {task.client && (
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Briefcase size={12} /> {task.client.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[9px] font-bold">
                              {task.assignedTo.name.charAt(0)}
                            </div>
                            {task.assignedTo.name.split(" ")[0]}
                          </div>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {formatRelativeTime(task.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Alerts & Rankings */}
        <div className="flex flex-col gap-6">
          
          {/* Urgent Tasks Bento Box */}
          {urgentTasks.length > 0 && (
            <div className="card glass-panel p-6 bg-gradient-to-b from-white to-red-50/30 dark:from-[#0f0f15] dark:to-red-950/10 border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl animate-pulse">
                  <Zap size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Fogo Cruzado 🔥</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                {urgentTasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all group">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                        {task.title}
                      </div>
                      {task.assignedTo && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Com: <span className="font-medium text-slate-700 dark:text-slate-300">{task.assignedTo.name}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ranking Bento Box */}
          {isAdmin && tasksByUser.length > 0 && (
            <div className="card glass-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Star size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Top Produtividade da Semana</h2>
              </div>
              
              <div className="flex flex-col gap-5">
                {tasksByUser.map((user, index) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const medal = medals[index] ?? `${index + 1}º`;
                  const max = tasksByUser[0]?._count.assignedTasks || 1;
                  const pct = Math.max((user._count.assignedTasks / max) * 100, 5); // min 5% for visual
                  
                  const gradientClasses = [
                    "from-indigo-500 to-purple-500",
                    "from-blue-500 to-indigo-500",
                    "from-emerald-500 to-blue-500"
                  ];
                  const barGradient = gradientClasses[index] || "from-slate-400 to-slate-500";

                  return (
                    <div key={user.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center">{medal}</span>
                          <span className="text-slate-700 dark:text-slate-300">{user.name}</span>
                        </div>
                        <span className="text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                          {user._count.assignedTasks}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${barGradient}`}
                          style={{
                            width: `${pct}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Stats Bento */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="card glass-panel p-4 flex flex-col items-center justify-center text-center gap-2">
                <Users size={20} className="text-indigo-500" />
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</div>
                <div className="text-xs font-medium text-slate-500">Membros</div>
              </div>
              <div className="card glass-panel p-4 flex flex-col items-center justify-center text-center gap-2">
                <Briefcase size={20} className="text-emerald-500" />
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalClients}</div>
                <div className="text-xs font-medium text-slate-500">Clientes</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
