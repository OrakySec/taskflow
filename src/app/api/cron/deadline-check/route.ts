import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";
import { buildDeadlineWarningMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  // Valida o secret do cron
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Busca tarefas com prazo nas próximas 24h que ainda não foram concluídas
    const urgentTasks = await prisma.task.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        deadline: { gte: now, lte: in24h },
      },
      include: {
        assignedTo: { select: { name: true } },
        company: { select: { id: true } },
      },
    });

    if (urgentTasks.length === 0) {
      return NextResponse.json({ message: "Nenhuma tarefa com prazo próximo." });
    }

    // Agrupa por empresa
    const byCompany = urgentTasks.reduce(
      (acc, task) => {
        const companyId = task.company.id;
        if (!acc[companyId]) acc[companyId] = [];
        acc[companyId].push(task);
        return acc;
      },
      {} as Record<string, typeof urgentTasks>
    );

    // Envia notificação para cada empresa
    for (const [companyId, tasks] of Object.entries(byCompany)) {
      const message = buildDeadlineWarningMessage(
        tasks.map((t) => ({
          title: t.title,
          assignedTo: t.assignedTo?.name,
          deadline: t.deadline!,
        }))
      );
      await sendNotification(companyId, message);
    }

    return NextResponse.json({ message: `Alertas enviados para ${Object.keys(byCompany).length} empresa(s).` });
  } catch (error) {
    console.error("Deadline check cron error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
