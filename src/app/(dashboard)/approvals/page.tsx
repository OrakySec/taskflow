"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Clock, Paperclip } from "lucide-react";
import CustomSelect, { SelectItem } from "@/components/ui/CustomSelect";
import { getInitials, getAvatarColor } from "@/lib/utils";

export default function ApprovalsPage() {
  const [draftTasks, setDraftTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Users for assignees
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("unassigned");
  const [approving, setApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  // Editable fields for approval
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, teamsRes] = await Promise.all([
        fetch("/api/tasks?status=DRAFT"),
        fetch("/api/users"),
        fetch("/api/teams")
      ]);
      if (tasksRes.ok) setDraftTasks(await tasksRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
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
      const isTeam = assignedToId.startsWith("team_");
      const assignedTeamId = isTeam ? assignedToId.replace("team_", "") : null;
      const assignedUserId = !isTeam && assignedToId !== "unassigned" ? assignedToId : null;

      const body: any = {
        title: editTitle,
        description: editDescription,
        deadline: editDeadline ? new Date(editDeadline).toISOString() : null,
        status: "OPEN",
        priority,
        assignedToId: assignedUserId,
        assignedTeamId
      };

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

  const handleReject = async () => {
    if (!selectedTask || !rejectReason.trim()) return;
    setApproving(true);
    try {
      const body: any = {
        title: selectedTask.title,
        description: selectedTask.description,
        status: "FAILED",
        failureReason: rejectReason,
      };

      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setSelectedTask(null);
        fetchData();
      } else {
        alert("Erro ao rejeitar tarefa.");
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
    { value: "unassigned", label: "Sem responsável" }
  ];
  if (teams.length > 0) {
    assigneeItems.push({
      label: "Equipes (Squads)",
      options: teams.map((t) => ({
        value: `team_${t.id}`,
        label: t.name,
        avatar: getInitials(t.name),
        avatarColor: getAvatarColor(t.name),
      })),
    });
  }
  if (users.length > 0) {
    assigneeItems.push({
      label: "Membros Individuais",
      options: users.filter(u => u.role !== "CLIENT").map((u) => ({
        value: u.id,
        label: u.name,
        avatar: getInitials(u.name),
        avatarColor: getAvatarColor(u.name),
      })),
    });
  }

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
                    setEditTitle(task.title);
                    setEditDescription(task.description || "");
                    setEditDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "");
                    setPriority("MEDIUM");
                    setAssignedToId("unassigned");
                    setIsRejecting(false);
                    setRejectReason("");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1a1a24] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 shrink-0 flex justify-between items-center bg-gray-50/50 dark:bg-[#13131a]/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#8b5cf6]" />
                Aprovar Solicitação
              </h2>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Esquerda: Informações da Tarefa (Ocupa mais espaço) */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-gray-50 dark:bg-[#13131a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Título da Tarefa</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#8b5cf6] font-medium text-lg transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Descrição Detalhada</label>
                      <textarea
                        rows={5}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none transition-all"
                      />
                    </div>
                  </div>
              
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Paperclip className="w-4 h-4 text-[#8b5cf6]" />
                    Anexos e Mídias ({selectedTask.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTask.attachments.map((file: any) => {
                      const isImage = file.mimeType?.startsWith('image/');
                      const isVideo = file.mimeType?.startsWith('video/');
                      // Consertar URL se usar minio:9000 ou localhost:9000
                      const displayUrl = file.fileUrl?.replace(/^http:\/\/(minio|localhost):9000/, '/api/minio') || '#';
                      
                      return (
                        <div key={file.id} className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#13131a] shadow-sm hover:shadow-md transition-all">
                          {isImage ? (
                            <a href={displayUrl} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-gray-200 dark:bg-gray-800">
                              <img src={displayUrl} alt={file.filename} className="w-full h-full object-contain" onError={(e) => {
                                // Fallback icon if image breaks
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML += '<div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs mt-2">Erro ao carregar</span></div>';
                              }} />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white text-sm font-medium flex items-center gap-2">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                  Ampliar
                                </span>
                              </div>
                            </a>
                          ) : isVideo ? (
                            <video src={displayUrl} controls className="w-full aspect-[4/3] object-contain bg-black" />
                          ) : (
                            <a href={displayUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center aspect-[4/3] p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              <Paperclip className="w-10 h-10 text-gray-400 mb-3" />
                              <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 break-all line-clamp-2 px-2">{file.filename}</span>
                            </a>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform">
                             <p className="text-xs text-white truncate text-center" title={file.filename}>{file.filename}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
                </div>

            {/* Direita: Controles e Rejeição */}
            <div className="space-y-4">
              {!isRejecting ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo de Entrega</label>
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#13131a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                    />
                  </div>

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
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Motivo da Rejeição (o cliente verá isso no portal) *
                    </label>
                    <textarea
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#13131a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                      rows={8}
                      placeholder="Ex: Faltam informações para iniciar..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-[#13131a]/50">
          {!isRejecting ? (
            <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 rounded-xl transition-colors font-medium"
                  >
                    Rejeitar
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
          ) : (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsRejecting(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
              >
                Voltar
              </button>
              <button
                onClick={handleReject}
                disabled={approving || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
              >
                {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirmar Rejeição
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
      )}
    </div>
  );
}
