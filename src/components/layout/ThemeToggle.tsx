"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <div className="w-[18px] h-[18px]" /> Tema
        </div>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      className="flex items-center justify-between w-full p-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 group"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <div className="flex items-center gap-3">
        {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
        <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
      </div>
      
      {/* Modern Toggle Switch side-by-side */}
      <div className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isDark ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}>
        <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-300 ${isDark ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}
