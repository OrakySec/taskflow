"use client";

import { useSession } from "next-auth/react";
import { Bell, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  toggleMobileSidebar: () => void;
  toggleDesktopSidebar: () => void;
  isCollapsed: boolean;
}

export default function Header({ title, toggleMobileSidebar, toggleDesktopSidebar, isCollapsed }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 bg-white/70 dark:bg-[#0a0a0c]/70 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden lg:flex p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
        </button>

        {/* Title */}
        {title && (
          <h1 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title="Notificações"
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-[#0a0a0c]" />
        </Link>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-default shadow-sm"
          title={user?.name || ""}
        >
          {user?.name ? getInitials(user.name) : "?"}
        </div>
      </div>
    </header>
  );
}
