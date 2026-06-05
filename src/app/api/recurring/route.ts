import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  daysOfWeek: z.string().optional(),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
  autoAssign: z.boolean().default(false),
  assignedToId: z.string().optional(),
  clientId: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const recurring = await prisma.recurringTask.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(recurring);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const data = parsed.data;

  const recurring = await prisma.recurringTask.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      frequency: data.frequency,
      daysOfWeek: data.frequency === "WEEKLY" ? data.daysOfWeek : null,
      dayOfMonth: data.frequency === "MONTHLY" ? data.dayOfMonth : null,
      autoAssign: data.autoAssign,
      assignedToId: data.autoAssign ? data.assignedToId || null : null,
      clientId: data.clientId || null,
      companyId: session.user.companyId,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(recurring, { status: 201 });
}
