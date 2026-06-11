import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { minioClient, BUCKET_NAME } from "@/lib/minio";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const attachment = await prisma.taskAttachment.findUnique({
    where: { id },
    include: { task: { select: { companyId: true } } },
  });

  if (!attachment) return NextResponse.json({ error: "Anexo não encontrado." }, { status: 404 });
  if (attachment.task.companyId !== session.user.companyId) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  // Remove do MinIO
  try {
    // fileUrl é /api/minio/BUCKET/objectName — extrai o objectName
    const parts = attachment.fileUrl.split(`/api/minio/${BUCKET_NAME}/`);
    if (parts.length === 2) {
      await minioClient.removeObject(BUCKET_NAME, parts[1]);
    }
  } catch {
    // Se falhar no MinIO, continua e remove do banco mesmo assim
    console.warn("Falha ao remover do MinIO:", attachment.fileUrl);
  }

  await prisma.taskAttachment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
