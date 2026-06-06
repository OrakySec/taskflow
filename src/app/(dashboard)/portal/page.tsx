"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Clock, CheckCircle, FileText } from "lucide-react";
import ClientRequestForm from "@/components/portal/ClientRequestForm";
import KanbanBoard from "@/components/tasks/KanbanBoard";

const PORTAL_COLUMNS = [
  { id: "DRAFT", title: "Em Análise" },
  { id: "OPEN", title: "Aprovada" },
  { id: "IN_PROGRESS", title: "Em Produção" },
  { id: "DONE", title: "Concluída" },
  { id: "FAILED", title: "Rejeitada" },
];

export default function ClientPortal() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchPortalData = async () => {
    try {
      const res = await fetch("/api/client-portal");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portal do Cliente</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Acompanhe suas solicitações e andamento das campanhas.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          {showForm ? <FileText className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Ver Minhas Tarefas" : "Nova Solicitação"}
        </button>
      </div>

      {showForm ? (
        <div className="max-w-3xl mx-auto">
          <ClientRequestForm onSuccess={() => {
            setShowForm(false);
            fetchPortalData();
          }} />
        </div>
      ) : (
        <>
          {/* METRICS */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-[#8b5cf6] rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Solicitado</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalRequests}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Em Análise</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.pendingRequests}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl">
                  <Loader2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Em Andamento</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.inProgressTasks}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1a1a24] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Concluídas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.completedTasks}</p>
                </div>
              </div>
            </div>
          )}

          {/* KANBAN DE TAREFAS */}
          <div className="h-[calc(100vh-280px)] min-h-[500px] mt-8">
            <KanbanBoard 
              initialTasks={tasks} 
              columns={PORTAL_COLUMNS} 
              readonly={true} 
            />
          </div>
        </>
      )}
    </div>
  );
}
