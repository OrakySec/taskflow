import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, memberIds } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingTeam = await prisma.team.findFirst({
      where: { id: id, companyId: user.companyId ?? "" }
    });

    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const team = await prisma.team.update({
      where: { id: id },
      data: {
        name,
        description,
        members: {
          set: (memberIds || []).map((id: string) => ({ id }))
        }
      },
      include: {
        members: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true } }
      }
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("PUT /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingTeam = await prisma.team.findFirst({
      where: { id: id, companyId: user.companyId ?? "" }
    });

    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    await prisma.team.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
