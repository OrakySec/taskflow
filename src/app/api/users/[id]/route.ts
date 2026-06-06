import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function DELETE(req: NextRequest, segmentData: { params: Params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await segmentData.params;

  // Evita que o admin exclua a si mesmo
  if (id === session.user.id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta por aqui." }, { status: 400 });
  }

  try {
    // Tenta deletar fisicamente
    await prisma.user.delete({
      where: { id, companyId: session.user.companyId },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Se der erro de foreign key constraint (Prisma P2003), fazemos soft-delete
    if (error.code === "P2003") {
      await prisma.user.update({
        where: { id, companyId: session.user.companyId },
        data: { isActive: false },
      });
      return NextResponse.json({ 
        success: true, 
        message: "O usuário possui tarefas ou comentários associados. Ele foi inativado ao invés de excluído." 
      });
    }
    
    return NextResponse.json({ error: "Erro ao excluir usuário." }, { status: 500 });
  }
}
