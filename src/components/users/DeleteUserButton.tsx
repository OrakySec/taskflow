"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Tem certeza que deseja remover o usuário ${userName}? Se ele possuir histórico de tarefas, ele será apenas inativado.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Erro ao remover usuário");
      } else {
        if (data.message) {
          alert(data.message);
        }
        router.refresh();
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="btn btn-secondary btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
      style={{ padding: "4px 8px" }}
      title="Excluir/Inativar Usuário"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}
