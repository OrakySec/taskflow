import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";
import { buildDailySummaryMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const companies = await prisma.company.findMany({
      where: {
        notificationConfig: {
          dailySummaryEnabled: true,
          OR: [
            { whatsappEnabled: true },
            { telegramEnabled: true },
          ],
        },
      },
      select: { id: true },
    });

    for (const company of companies) {
      const [open, inProgress, doneToday, overdue] = await Promise.all([
        prisma.task.count({ where: { companyId: company.id, status: "OPEN" } }),
        prisma.task.count({ where: { companyId: company.id, status: "IN_PROGRESS" } }),
        prisma.task.count({
          where: {
            companyId: company.id,
            status: "DONE",
            completedAt: { gte: todayStart },
          },
        }),
        prisma.task.count({
          where: {
            companyId: company.id,
            status: { in: ["OPEN", "IN_PROGRESS"] },
            deadline: { lt: now },
          },
        }),
      ]);

      const dateStr = now.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
      });

      const message = buildDailySummaryMessage({
        open,
        inProgress,
        doneToday,
        overdue,
        date: dateStr,
      });

      await sendNotification(company.id, message);
    }

    return NextResponse.json({ message: `Resumo enviado para ${companies.length} empresa(s).` });
  } catch (error) {
    console.error("Daily summary cron error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
