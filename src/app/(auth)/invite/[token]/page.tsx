import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AcceptInviteForm from "@/components/users/AcceptInviteForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aceitar Convite" };

type Params = Promise<{ token: string }>;

export default async function InvitePage({ params }: { params: Params }) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { company: { select: { name: true } } },
  });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) notFound();

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "8px" }}>TaskFlow</div>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Você foi convidado para <strong>{invite.company.name}</strong></p>
      </div>
      <AcceptInviteForm token={token} email={invite.email} companyName={invite.company.name} />
    </div>
  );
}
