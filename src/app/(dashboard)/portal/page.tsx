"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Clock, CheckCircle, FileText } from "lucide-react";
import ClientRequestForm from "@/components/portal/ClientRequestForm";

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

          {/* LISTA DE TAREFAS */}
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Atividades Recentes</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Você ainda não possui nenhuma solicitação.
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#1f1f2e] transition-colors">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white text-lg">{task.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        {task.status === "DRAFT" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">Em Análise</span>
                        )}
                        {task.status === "OPEN" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Aprovada</span>
                        )}
                        {task.status === "IN_PROGRESS" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">Em Produção</span>
                        )}
                        {task.status === "DONE" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">Concluída</span>
                        )}
                        {task.status === "FAILED" && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">Rejeitada</span>
                        )}
                        
                        <span className="text-xs text-gray-400">
                          {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {task.status === 'FAILED' && task.comments?.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-800 dark:text-red-300">
                            <strong>Motivo da rejeição:</strong> {task.comments[0].content.replace('❌ **Motivo da falha:** ', '')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {task.assignedTo && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Responsável:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center text-xs font-bold">
                            {task.assignedTo.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium dark:text-gray-300">{task.assignedTo.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
