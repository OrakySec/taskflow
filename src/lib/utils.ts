import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "agora mesmo";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return formatDate(date);
}

export function isOverdue(deadline: Date | string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    "#F43F5E", // Rose
    "#8B5CF6", // Violet
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#6366F1", // Indigo
    "#14B8A6", // Teal
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const PRIORITY_LABELS = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const STATUS_LABELS = {
  DRAFT: "Pendente/Rascunho",
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  DONE: "Concluído",
  FAILED: "Falhou",
};

export const PRIORITY_COLORS = {
  LOW: "priority-LOW",
  MEDIUM: "priority-MEDIUM",
  HIGH: "priority-HIGH",
  URGENT: "priority-URGENT",
};

export const STATUS_COLORS = {
  DRAFT: "status-DRAFT",
  OPEN: "status-OPEN",
  IN_PROGRESS: "status-IN_PROGRESS",
  DONE: "status-DONE",
  FAILED: "status-FAILED",
};

export const ROLE_LABELS = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  COLLABORATOR: "Colaborador",
  CLIENT: "Cliente",
};

export function getPriorityClass(priority: string): string {
  return `priority-${priority}`;
}
