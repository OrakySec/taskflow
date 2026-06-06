/**
 * Integração com Evolution API (WhatsApp)
 * Documentação: https://doc.evolution-api.com
 */

interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  groupId: string;
}

interface SendMessageOptions {
  config: EvolutionConfig;
  message: string;
  targetId?: string; // Se não informado, usa o groupId da config
}

async function evolutionRequest(
  config: EvolutionConfig,
  endpoint: string,
  body: object
) {
  const response = await fetch(`${config.apiUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error: ${response.status} — ${error}`);
  }

  return response.json();
}

export async function sendWhatsAppMessage({
  config,
  message,
  targetId,
}: SendMessageOptions) {
  const chatId = targetId || config.groupId;

  console.log(`[WhatsApp API] Sending message. targetId: "${targetId}", fallback groupId: "${config.groupId}", final chatId: "${chatId}"`);

  return evolutionRequest(config, `/message/sendText/taskflow`, {
    number: chatId,
    text: message,
  });
}

// ─────────────────────────────────────────────
// Mensagens formatadas por evento
// ─────────────────────────────────────────────

export function buildTaskCreatedMessage(task: {
  title: string;
  priority: string;
  assignedTo?: string | null;
  client?: string | null;
  deadline?: Date | null;
  createdBy: string;
}) {
  const priorityEmoji: Record<string, string> = {
    LOW: "🟢",
    MEDIUM: "🟡",
    HIGH: "🟠",
    URGENT: "🔴",
  };

  const priorityLabel: Record<string, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    URGENT: "Urgente",
  };

  let msg = `📋 *Nova Tarefa Criada*\n\n`;
  msg += `*${task.title}*\n`;
  msg += `${priorityEmoji[task.priority]} Prioridade: ${priorityLabel[task.priority]}\n`;

  if (task.client) msg += `👥 Cliente: ${task.client}\n`;
  if (task.assignedTo) msg += `👤 Responsável: ${task.assignedTo}\n`;
  if (task.deadline) {
    const date = new Date(task.deadline).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    msg += `⏰ Prazo: ${date}\n`;
  }

  msg += `\n_Criada por ${task.createdBy}_`;
  return msg;
}

export function buildTaskStatusChangedMessage(task: {
  title: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  failureReason?: string | null;
}) {
  const statusEmoji: Record<string, string> = {
    OPEN: "📂",
    IN_PROGRESS: "⚡",
    DONE: "✅",
    FAILED: "❌",
  };

  const statusLabel: Record<string, string> = {
    OPEN: "Aberta",
    IN_PROGRESS: "Em Andamento",
    DONE: "Concluída",
    FAILED: "Falhou",
  };

  let msg = `${statusEmoji[task.newStatus]} *Tarefa Atualizada*\n\n`;
  msg += `*${task.title}*\n`;
  msg += `Status: ${statusLabel[task.oldStatus]} → *${statusLabel[task.newStatus]}*\n`;

  if (task.failureReason) msg += `\n⚠️ Motivo: ${task.failureReason}\n`;

  msg += `\n_Por ${task.changedBy}_`;
  return msg;
}

export function buildDeadlineWarningMessage(tasks: Array<{
  title: string;
  assignedTo?: string | null;
  deadline: Date;
}>) {
  let msg = `⏰ *Atenção: Tarefas com prazo próximo*\n\n`;

  tasks.forEach((task) => {
    const deadline = new Date(task.deadline).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    msg += `• *${task.title}*`;
    if (task.assignedTo) msg += ` (${task.assignedTo})`;
    msg += ` — ${deadline}\n`;
  });

  return msg;
}

export function buildDailySummaryMessage(summary: {
  open: number;
  inProgress: number;
  doneToday: number;
  overdue: number;
  date: string;
}) {
  let msg = `☀️ *Resumo do Dia — ${summary.date}*\n\n`;
  msg += `📂 Abertas: *${summary.open}*\n`;
  msg += `⚡ Em andamento: *${summary.inProgress}*\n`;
  msg += `✅ Concluídas hoje: *${summary.doneToday}*\n`;

  if (summary.overdue > 0) {
    msg += `🔴 Atrasadas: *${summary.overdue}*\n`;
  }

  msg += `\nBom trabalho a todos! 🚀`;
  return msg;
}

export function buildWeeklyRankingMessage(ranking: Array<{
  name: string;
  completed: number;
  position: number;
}>) {
  const medals = ["🥇", "🥈", "🥉"];
  let msg = `🏆 *Ranking Semanal — TaskFlow*\n\n`;

  ranking.slice(0, 5).forEach((user, index) => {
    const medal = medals[index] || `${index + 1}º`;
    msg += `${medal} ${user.name} — ${user.completed} tarefas\n`;
  });

  msg += `\nParabéns a todos! Continue assim! 💪`;
  return msg;
}
