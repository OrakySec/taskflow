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
      take: 5,
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
      take: 3,
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
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 className="page-title">
          Bom dia, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="page-subtitle">
          Aqui está um resumo do que está acontecendo hoje.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div className="stat-card stat-card-accent">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Tarefas Abertas
              </div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-1px" }}>
                {stats.totalOpen}
              </div>
            </div>
            <div style={{ padding: "10px", background: "var(--accent-subtle)", borderRadius: "10px" }}>
              <CheckSquare size={20} color="var(--accent-hover)" />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: "2px solid var(--blue)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Em Andamento
              </div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-1px" }}>
                {stats.totalInProgress}
              </div>
            </div>
            <div style={{ padding: "10px", background: "var(--blue-subtle)", borderRadius: "10px" }}>
              <Clock size={20} color="var(--blue)" />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Concluídas Hoje
              </div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-1px" }}>
                {stats.doneToday}
              </div>
            </div>
            <div style={{ padding: "10px", background: "var(--green-subtle)", borderRadius: "10px" }}>
              <TrendingUp size={20} color="var(--green)" />
            </div>
          </div>
        </div>

        {stats.overdue > 0 && (
          <div className="stat-card stat-card-red">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  Atrasadas ⚠️
                </div>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--red)", letterSpacing: "-1px" }}>
                  {stats.overdue}
                </div>
              </div>
              <div style={{ padding: "10px", background: "var(--red-subtle)", borderRadius: "10px" }}>
                <AlertTriangle size={20} color="var(--red)" />
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Colaboradores
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-1px" }}>
                    {stats.totalUsers}
                  </div>
                </div>
                <div style={{ padding: "10px", background: "var(--accent-subtle)", borderRadius: "10px" }}>
                  <Users size={20} color="var(--accent-hover)" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Clientes
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-1px" }}>
                    {stats.totalClients}
                  </div>
                </div>
                <div style={{ padding: "10px", background: "var(--green-subtle)", borderRadius: "10px" }}>
                  <Briefcase size={20} color="var(--green)" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Recent tasks */}
        <div className="card" style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
              Tarefas Recentes
            </h2>
            <Link
              href="/tasks"
              className="btn btn-ghost btn-sm"
              style={{ gap: "4px", fontSize: "12px" }}
            >
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckSquare size={28} />
              </div>
              <p style={{ fontSize: "14px", marginBottom: "12px" }}>
                Nenhuma tarefa ainda
              </p>
              <Link href="/tasks/new" className="btn btn-primary btn-sm">
                Criar primeira tarefa
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className={`task-card task-card-${task.priority.toLowerCase()}`}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "var(--text-primary)",
                            marginBottom: "6px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {task.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className={`badge priority-${task.priority}`}
                          >
                            {PRIORITY_LABELS[task.priority]}
                          </span>
                          <span
                            className={`badge status-${task.status}`}
                          >
                            {STATUS_LABELS[task.status]}
                          </span>
                          {task.client && (
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              {task.client.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {task.assignedTo && (
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                            {task.assignedTo.name}
                          </div>
                        )}
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {formatRelativeTime(task.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Urgent tasks */}
          {urgentTasks.length > 0 && (
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Zap size={16} color="var(--red)" />
                <h2 style={{ fontSize: "14px", fontWeight: "600", color: "var(--red)" }}>
                  Urgentes
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {urgentTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "var(--red-subtle)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>
                        {task.title}
                      </div>
                      {task.assignedTo && (
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {task.assignedTo.name}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ranking semanal */}
          {isAdmin && tasksByUser.length > 0 && (
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <TrendingUp size={16} color="var(--accent-hover)" />
                <h2 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  Ranking desta semana
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {tasksByUser.map((user, index) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const medal = medals[index] ?? `${index + 1}`;
                  const max = tasksByUser[0]?._count.assignedTasks || 1;
                  const pct = (user._count.assignedTasks / max) * 100;

                  return (
                    <div key={user.id}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "14px" }}>{medal}</span>
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                            {user.name}
                          </span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                          {user._count.assignedTasks}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "4px",
                          background: "var(--bg-secondary)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background:
                              index === 0
                                ? "linear-gradient(90deg, var(--accent), var(--accent-hover))"
                                : "var(--border-hover)",
                            borderRadius: "2px",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick actions */}
          {isAdmin && (
            <div className="card" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "14px" }}>
                Ações Rápidas
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link href="/tasks/new" className="btn btn-primary btn-sm" style={{ justifyContent: "flex-start" }}>
                  <CheckSquare size={15} /> Nova Tarefa
                </Link>
                <Link href="/clients/new" className="btn btn-secondary btn-sm" style={{ justifyContent: "flex-start" }}>
                  <Briefcase size={15} /> Novo Cliente
                </Link>
                <Link href="/users/invite" className="btn btn-secondary btn-sm" style={{ justifyContent: "flex-start" }}>
                  <Users size={15} /> Convidar Colaborador
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
