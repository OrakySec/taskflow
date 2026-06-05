import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  daysOfWeek: z.string().optional().nullable(),
  dayOfMonth: z.number().int().min(1).max(28).optional().nullable(),
  autoAssign: z.boolean().optional(),
  assignedToId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };

  // Limpa campos irrelevantes conforme frequency
  if (data.frequency === "DAILY") { updateData.daysOfWeek = null; updateData.dayOfMonth = null; }
  if (data.frequency === "WEEKLY") { updateData.dayOfMonth = null; }
  if (data.frequency === "MONTHLY") { updateData.daysOfWeek = null; }
  if (data.autoAssign === false) { updateData.assignedToId = null; }

  const result = await prisma.recurringTask.updateMany({
    where: { id, companyId: session.user.companyId },
    data: updateData,
  });

  if (result.count === 0) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  await prisma.recurringTask.deleteMany({ where: { id, companyId: session.user.companyId } });
  return NextResponse.json({ success: true });
}
