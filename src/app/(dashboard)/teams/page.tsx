import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import TeamsClient from "./TeamsClient";

export const metadata: Metadata = { title: "Equipes (Squads)" };

export default async function TeamsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const isAdminOrManager = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isAdminOrManager) redirect("/dashboard");

  const teams = await prisma.team.findMany({
    where: { companyId: session.user.companyId },
    include: {
      members: { select: { id: true, name: true, avatar: true } },
      _count: { select: { tasks: true } }
    },
    orderBy: { name: "asc" },
  });

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId, isActive: true },
    select: { id: true, name: true, avatar: true },
    orderBy: { name: "asc" }
  });

  return <TeamsClient initialTeams={teams} users={users} />;
}
