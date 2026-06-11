import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  taskId: z.string().min(1),
  filename: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { taskId, filename, fileUrl, fileSize, mimeType } = parsed.data;

  // Verifica se a tarefa pertence à empresa do usuário
  const task = await prisma.task.findFirst({
    where: { id: taskId, companyId: session.user.companyId },
  });
  if (!task) return NextResponse.json({ error: "Tarefa não encontrada." }, { status: 404 });

  const attachment = await prisma.taskAttachment.create({
    data: { taskId, filename, fileUrl, fileSize, mimeType },
  });

  return NextResponse.json(attachment, { status: 201 });
}
