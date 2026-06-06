import { useSession, signOut } from "next-auth/react";
import { Menu, PanelLeftClose, PanelLeftOpen, User, LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import NotificationDropdown from "./NotificationDropdown";

interface HeaderProps {
  title?: string;
  toggleMobileSidebar: () => void;
  toggleDesktopSidebar: () => void;
  isCollapsed: boolean;
}

export default function Header({ title, toggleMobileSidebar, toggleDesktopSidebar, isCollapsed }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use the avatar from session if available (Note: might need a page reload to reflect if session isn't updated, but that's standard for next-auth)
  const avatarUrl = (user as any)?.avatar || null;

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
        <NotificationDropdown />

        {/* Avatar Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm hover:ring-2 hover:ring-indigo-500/50 transition-all"
            title={user?.name || ""}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name || "Avatar"} className="w-full h-full object-cover" />
            ) : (
              user?.name ? getInitials(user.name) : "?"
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#15151a] rounded-xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 border border-slate-200 dark:border-white/10 overflow-hidden z-50 transform origin-top-right transition-all">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0c]/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link 
                  href="/profile" 
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <User size={16} />
                  Editar Perfil
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
