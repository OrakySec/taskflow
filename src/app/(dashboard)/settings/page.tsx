import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NotificationSettings from "@/components/settings/NotificationSettings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin) redirect("/dashboard");

  const config = await prisma.notificationConfig.findUnique({
    where: { companyId: session.user.companyId },
  });

  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie as configurações da sua empresa.</p>
      </div>
      <NotificationSettings initialConfig={config} />
    </div>
  );
}
