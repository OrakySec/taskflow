import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const teams = await prisma.team.findMany({
      where: { companyId: user.companyId },
      include: {
        members: {
          select: { id: true, name: true, avatar: true }
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apenas Admin ou Manager deve poder criar times
    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, memberIds } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const team = await prisma.team.create({
      data: {
        name,
        description,
        companyId: user.companyId,
        members: {
          connect: (memberIds || []).map((id: string) => ({ id }))
        }
      },
      include: {
        members: { select: { id: true, name: true, avatar: true } },
        _count: { select: { tasks: true } }
      }
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
