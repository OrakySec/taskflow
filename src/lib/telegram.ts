/**
 * Integração com Telegram Bot API
 */

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export async function sendTelegramMessage(
  config: TelegramConfig,
  message: string
) {
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: config.chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${response.status} — ${error}`);
  }

  return response.json();
}

/**
 * Envia notificação privada para um usuário no Telegram
 * (requer que o usuário tenha iniciado conversa com o bot)
 */
export async function sendTelegramPrivateMessage(
  botToken: string,
  userId: string,
  message: string
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: userId,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    console.error("Telegram private message error:", await response.text());
  }

  return response.json();
}
