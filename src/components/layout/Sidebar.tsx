"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Briefcase,
  LayoutTemplate,
  RefreshCw,
  Settings,
  LogOut,
  Zap,
  Network,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/clients", label: "Clientes", icon: Briefcase },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/recurring", label: "Recorrentes", icon: RefreshCw },
  { href: "/teams", label: "Equipes (Squads)", icon: Network },
  { href: "/users", label: "Usuários", icon: Users },
];

const bottomItems = [
  { href: "/settings", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, isCollapsed, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-white/70 dark:bg-[#060609]/80 backdrop-blur-2xl
        border-r border-slate-200/50 dark:border-white/5
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "max-lg:flex lg:hidden" : "w-64 opacity-100 lg:static"}
      `}
    >
      <div className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 pb-6 border-b border-slate-200/50 dark:border-white/10 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Zap size={18} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-300">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                TaskFlow
              </span>
              {user?.companyName && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                  {user.companyName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? "drop-shadow-sm" : "group-hover:scale-110 transition-transform"} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="pt-4 mt-auto border-t border-slate-200/50 dark:border-white/10 flex flex-col gap-1.5">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "px-3"} py-2`}>
            <ThemeToggle />
          </div>
          
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}

          {/* User info */}
          <div className={`
            flex items-center gap-3 mt-2 rounded-xl transition-all
            ${isCollapsed ? "justify-center p-2" : "p-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10"}
          `}>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || "Avatar"} className="w-full h-full object-cover" />
              ) : (
                user?.name ? getInitials(user.name) : "?"
              )}
            </div>
            
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.role === "ADMIN" ? "Admin" : user?.role === "MANAGER" ? "Gerente" : "Colaborador"}
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Sair"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
