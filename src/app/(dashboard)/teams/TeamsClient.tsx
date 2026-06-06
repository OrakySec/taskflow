"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Network, CheckSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";

type User = { id: string; name: string; avatar: string | null };
type Team = { id: string; name: string; description: string | null; members: User[]; _count: { tasks: number } };

export default function TeamsClient({ initialTeams, users }: { initialTeams: Team[]; users: User[] }) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", memberIds: [] as string[] });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const openModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, description: team.description || "", memberIds: team.members.map(m => m.id) });
    } else {
      setEditingTeam(null);
      setFormData({ name: "", description: "", memberIds: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const toggleMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id) 
        ? prev.memberIds.filter(mId => mId !== id)
        : [...prev.memberIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`/api/teams${editingTeam ? `/${editingTeam.id}` : ""}`, {
        method: editingTeam ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const updatedTeam = await res.json();
        if (editingTeam) {
          setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
        } else {
          setTeams([updatedTeam, ...teams]);
        }
        closeModal();
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta equipe? As tarefas atribuídas a ela ficarão sem responsável.")) return;
    
    const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTeams(teams.filter(t => t.id !== id));
      router.refresh();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Equipes (Squads)</h1>
          <p className="page-subtitle">{teams.length} equipe{teams.length !== 1 ? "s" : ""} registrada{teams.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary"><Plus size={16} /> Nova Equipe</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {teams.map((team) => (
          <div key={team.id} className="card p-5" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                  <Network size={20} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: "var(--text-primary)" }}>{team.name}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{team.description || "Sem descrição"}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => openModal(team)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(team.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
              <CheckSquare size={14} /> {team._count.tasks} tarefas atribuídas
            </div>

            <div>
              <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "8px" }}>Membros ({team.members.length})</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {team.members.map(m => (
                  <div key={m.id} className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" title={m.name}>
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                      {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : getInitials(m.name)}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{m.name.split(" ")[0]}</span>
                  </div>
                ))}
                {team.members.length === 0 && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Nenhum membro</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#0a0a0c] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden flex flex-col max-h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 shrink-0">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {editingTeam ? "Editar Equipe" : "Nova Equipe"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
              <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Equipe *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm" placeholder="Ex: Equipe de Design" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                  <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Membros da Equipe</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                        <input type="checkbox" checked={formData.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                          {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : getInitials(u.name)}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{u.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-white/5">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" disabled={saving || !formData.name} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar Equipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
