"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, Circle, AlertCircle, MessageSquare, UserPlus, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Initial fetch for unread dot
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id?: string) => {
    try {
      const body = id ? { id } : { markAll: true };
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        if (id) {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TASK_MENTION": return <MessageSquare size={16} className="text-blue-500" />;
      case "TASK_COMMENT": return <MessageSquare size={16} className="text-indigo-500" />;
      case "TASK_ASSIGNED": return <UserPlus size={16} className="text-emerald-500" />;
      case "TASK_DEADLINE_WARNING": return <Clock size={16} className="text-amber-500" />;
      case "TASK_OVERDUE": return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors ${isOpen ? 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        title="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-[#0a0a0c]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#15151a] rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 border border-slate-200 dark:border-white/10 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0c]/50">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()}
                className="text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2 mx-auto"></div>
                <p className="text-sm mt-2">Carregando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhuma notificação por enquanto.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <div key={n.id} className={`group flex gap-3 p-4 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}>
                    <div className="mt-0.5 flex-shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {n.link ? (
                        <Link href={n.link} onClick={() => { setIsOpen(false); if(!n.isRead) markAsRead(n.id); }}>
                          <p className={`text-sm mb-0.5 ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.body}</p>
                        </Link>
                      ) : (
                        <div onClick={() => !n.isRead && markAsRead(n.id)} className="cursor-pointer">
                          <p className={`text-sm mb-0.5 ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.body}</p>
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {!n.isRead && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                        className="flex-shrink-0 flex items-center justify-center p-1"
                        title="Marcar como lida"
                      >
                        <Circle size={10} className="fill-indigo-500 text-indigo-500 group-hover:opacity-0 transition-opacity absolute" />
                        <CheckCircle2 size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
