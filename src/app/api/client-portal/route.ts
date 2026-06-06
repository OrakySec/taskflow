import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Não autorizado. Apenas clientes.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'ALL'; // ALL, PENDING, OPEN, COMPLETED

    // Obter os detalhes do usuário logado (para pegar o clientId)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.clientId) {
      return NextResponse.json({ error: 'Cliente não encontrado no seu perfil.' }, { status: 400 });
    }

    const clientId = user.clientId;
    const companyId = session.user.companyId;

    // Métricas
    const totalRequests = await prisma.task.count({
      where: { clientId, companyId }
    });

    const pendingRequests = await prisma.task.count({
      where: { clientId, companyId, status: 'DRAFT' }
    });

    const inProgressTasks = await prisma.task.count({
      where: { clientId, companyId, status: { in: ['OPEN', 'IN_PROGRESS'] } }
    });

    const completedTasks = await prisma.task.count({
      where: { clientId, companyId, status: 'DONE' }
    });

    // Tarefas
    let statusFilter = {};
    if (filter === 'PENDING') statusFilter = { status: 'DRAFT' };
    if (filter === 'OPEN') statusFilter = { status: { in: ['OPEN', 'IN_PROGRESS'] } };
    if (filter === 'COMPLETED') statusFilter = { status: 'DONE' };

    const tasks = await prisma.task.findMany({
      where: {
        clientId,
        companyId,
        ...statusFilter
      },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: {
          select: { name: true, avatar: true }
        },
        attachments: true
      }
    });

    return NextResponse.json({
      metrics: {
        totalRequests,
        pendingRequests,
        inProgressTasks,
        completedTasks
      },
      tasks
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar dados do portal:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
