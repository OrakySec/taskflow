"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import CustomSelect, { SelectItem } from "@/components/ui/CustomSelect";
import { getInitials, getAvatarColor } from "@/lib/utils";

export default function ApprovalsPage() {
  const [draftTasks, setDraftTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Users for assignees
  const [users, setUsers] = useState<any[]>([]);
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("unassigned");
  const [approving, setApproving] = useState(false);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch("/api/tasks?status=DRAFT"),
        fetch("/api/users")
      ]);
      if (tasksRes.ok) setDraftTasks(await tasksRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async () => {
    if (!selectedTask) return;
    setApproving(true);
    try {
      const body: any = {
        title: selectedTask.title,
        description: selectedTask.description,
        status: "OPEN",
        priority
      };
      if (assignedToId !== "unassigned") {
        body.assignedToId = assignedToId;
      } else {
        body.assignedToId = null;
      }

      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setSelectedTask(null);
        fetchData(); // reload
      } else {
        alert("Erro ao aprovar tarefa.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  const priorityItems: SelectItem[] = [
    { value: "LOW", label: "Baixa", badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
    { value: "MEDIUM", label: "Média", badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400" },
    { value: "HIGH", label: "Alta", badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" },
    { value: "URGENT", label: "Urgente", badgeClass: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
  ];

  const assigneeItems: SelectItem[] = [
    { value: "unassigned", label: "Sem responsável", badgeClass: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
    ...users.filter(u => u.role !== "CLIENT").map(u => ({
      value: u.id,
      label: u.name,
      avatar: u.name,
      avatarColor: getAvatarColor(u.name),
      badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }))
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aprovações</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Solicitações de clientes aguardando triagem.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {draftTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Nenhuma solicitação pendente no momento.
            </div>
          ) : (
            draftTasks.map((task) => (
              <div key={task.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#1f1f2e] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">Pendente</span>
                    <span className="text-xs text-gray-400">De: {task.client?.name || "Cliente Desconhecido"}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setPriority("MEDIUM");
                    setAssignedToId("unassigned");
                  }}
                  className="shrink-0 flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Triar / Aprovar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aprovar Solicitação</h2>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-[#13131a] rounded-xl">
              <h3 className="font-medium text-gray-900 dark:text-white">{selectedTask.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{selectedTask.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
                <CustomSelect
                  items={priorityItems}
                  value={priority}
                  onChange={setPriority}
                  placeholder="Selecione..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsável</label>
                <CustomSelect
                  items={assigneeItems}
                  value={assignedToId}
                  onChange={setAssignedToId}
                  placeholder="Selecione o responsável..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-4 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
              >
                {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Aprovar Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
