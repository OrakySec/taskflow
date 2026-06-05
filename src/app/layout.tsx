import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
