import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TaskFlow — Gestão de Tarefas",
    template: "%s | TaskFlow",
  },
  description:
    "Sistema de organização de tarefas para equipes de gestão de tráfego. Delegue, acompanhe e gerencie suas tarefas com eficiência.",
  keywords: ["gestão de tarefas", "equipe", "tráfego pago", "produtividade"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
