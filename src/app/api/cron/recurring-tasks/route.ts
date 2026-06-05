import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST() {
  const headersList = await headers();
  const auth = headersList.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();
  const todayDow = now.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
  const todayDom = now.getDate(); // 1-31
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const actives = await prisma.recurringTask.findMany({
    where: { isActive: true },
  });

  let created = 0;

  for (const rt of actives) {
    // Já rodou hoje?
    if (rt.lastRunAt && rt.lastRunAt >= todayStart) continue;

    let shouldRun = false;

    if (rt.frequency === "DAILY") {
      shouldRun = true;
    } else if (rt.frequency === "WEEKLY" && rt.daysOfWeek) {
      const days = rt.daysOfWeek.split(",").map(Number);
      shouldRun = days.includes(todayDow);
    } else if (rt.frequency === "MONTHLY" && rt.dayOfMonth) {
      shouldRun = rt.dayOfMonth === todayDom;
    }

    if (!shouldRun) continue;

    // Busca um admin da empresa para usar como createdBy
    const admin = await prisma.user.findFirst({
      where: { companyId: rt.companyId, role: "ADMIN", isActive: true },
    });

    if (!admin) continue;

    await prisma.task.create({
      data: {
        title: rt.title,
        description: rt.description,
        priority: rt.priority,
        status: "OPEN",
        companyId: rt.companyId,
        createdById: admin.id,
        assignedToId: rt.autoAssign ? rt.assignedToId : null,
        clientId: rt.clientId,
      },
    });

    await prisma.recurringTask.update({
      where: { id: rt.id },
      data: { lastRunAt: now },
    });

    created++;
  }

  return NextResponse.json({ created, checked: actives.length });
}
