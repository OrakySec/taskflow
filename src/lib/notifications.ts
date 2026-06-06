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

/**
 * Envia notificação pessoal via WhatsApp / Telegram para o usuário
 */
export async function sendPersonalNotification(
  companyId: string,
  user: { name: string; phone?: string | null; notifyTelegram: boolean; notifyWhatsapp: boolean },
  message: string,
  telegramFallbackGroup: boolean = true
) {
  try {
    const config = await prisma.notificationConfig.findUnique({
      where: { companyId },
    });

    if (!config) return;

    const promises: Promise<unknown>[] = [];

    // WhatsApp privado
    if (
      user.notifyWhatsapp &&
      user.phone &&
      config.whatsappEnabled &&
      config.whatsappApiUrl &&
      config.whatsappApiKey
    ) {
      // Remover não-números do telefone e garantir o código do país
      let phone = user.phone.replace(/\D/g, "");
      if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;

      promises.push(
        sendWhatsAppMessage({
          config: {
            apiUrl: config.whatsappApiUrl,
            apiKey: config.whatsappApiKey,
            groupId: "", // não usado para DM
          },
          targetId: phone,
          message,
        }).catch((err) => console.error("WhatsApp personal notification error:", err))
      );
    }

    // Telegram (O Bot não consegue mandar mensagem privada via número de telefone. 
    // Como fallback, enviamos para o grupo avisando o usuário pelo nome)
    if (
      user.notifyTelegram &&
      telegramFallbackGroup &&
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
          `📢 Atenção ${user.name}:\n\n${message}`
        ).catch((err) => console.error("Telegram personal fallback error:", err))
      );
    }

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("sendPersonalNotification error:", error);
  }
}
