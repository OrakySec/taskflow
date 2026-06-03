/**
 * Serviço centralizado de notificações
 * Envia via WhatsApp e/ou Telegram conforme configuração da empresa
 */

import { prisma } from "./prisma";
import { sendWhatsAppMessage } from "./whatsapp";
import { sendTelegramMessage } from "./telegram";

export async function sendNotification(companyId: string, message: string) {
  try {
    const config = await prisma.notificationConfig.findUnique({
      where: { companyId },
    });

    if (!config) return;

    const promises: Promise<unknown>[] = [];

    if (
      config.whatsappEnabled &&
      config.whatsappApiUrl &&
      config.whatsappApiKey &&
      config.whatsappGroupId
    ) {
      promises.push(
        sendWhatsAppMessage({
          config: {
            apiUrl: config.whatsappApiUrl,
            apiKey: config.whatsappApiKey,
            groupId: config.whatsappGroupId,
          },
          message,
        }).catch((err) => console.error("WhatsApp notification error:", err))
      );
    }

    if (
      config.telegramEnabled &&
      config.telegramBotToken &&
      config.telegramChatId
    ) {
      promises.push(
        sendTelegramMessage(
          {
            botToken: config.telegramBotToken,
            chatId: config.telegramChatId,
          },
          message
        ).catch((err) => console.error("Telegram notification error:", err))
      );
    }

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("sendNotification error:", error);
  }
}

/**
 * Cria notificação interna para um usuário
 */
export async function createInternalNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type: type as never,
      title,
      body,
      link,
    },
  });
}
