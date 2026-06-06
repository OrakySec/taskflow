"use client";

import { useState } from "react";
import { User, Smartphone, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

const bgColors = [
  "ff3366", "00c4cc", "ff9900", "8a2be2", "32cd32", 
  "ff1493", "1e90ff", "ffda03", "ff4500", "9400d3", 
  "00fa9a", "ff00ff", "00bfff", "dc143c", "adff2f"
];

// Define some predefined DiceBear avatars with colorful backgrounds
const PREDEFINED_AVATARS = Array.from({ length: 30 }).map((_, i) => {
  const bg = bgColors[i % bgColors.length];
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=taskflow${i + 1}&backgroundColor=${bg}`;
});

export default function ProfileClient({ user }: { user: any }) {
  const { update } = useSession();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(user.notifyWhatsapp || false);
  const [notifyTelegram, setNotifyTelegram] = useState(user.notifyTelegram || false);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, notifyWhatsapp, notifyTelegram, avatar }),
      });

      if (res.ok) {
        await update({ avatar }); // Update local session
        setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
        router.refresh(); // Refresh page to update header avatar
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Erro ao salvar." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Erro ao conectar com o servidor." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="text-indigo-500" /> Meu Perfil
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie suas informações pessoais e preferências de notificação.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* AVATAR SELECTION */}
        <div className="card p-6 border border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0a0a0c]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Foto de Perfil</h2>
          <div className="flex flex-wrap gap-4">
            <div 
              onClick={() => setAvatar("")}
              className={`w-16 h-16 rounded-full cursor-pointer flex items-center justify-center font-bold text-xl transition-all shadow-sm ${!avatar ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-[#15151a] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 hover:scale-105'}`}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            {PREDEFINED_AVATARS.map((url, i) => (
              <img 
                key={i} 
                src={url} 
                alt={`Avatar ${i}`} 
                onClick={() => setAvatar(url)}
                className={`w-16 h-16 rounded-full cursor-pointer transition-all bg-slate-50 dark:bg-white/5 shadow-sm hover:scale-105 ${avatar === url ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-[#15151a]' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">Escolha um dos avatares acima para te representar. Em breve adicionaremos a opção de enviar sua própria foto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PERSONAL INFO */}
          <div className="card p-6 space-y-5 border border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0a0a0c]">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Informações Pessoais</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
              <input 
                type="email" 
                value={user.email} 
                className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-500 cursor-not-allowed" 
                disabled 
                title="O email não pode ser alterado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número de Telefone</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Insira seu número com DDD.</p>
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div className="card p-6 space-y-4 border border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0a0a0c]">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Preferências de Mensagens</h2>
            
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                  Notificações no WhatsApp
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Receba avisos quando for mencionado ou receber tarefas via WhatsApp. (Requer número de telefone preenchido)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                <input type="checkbox" checked={notifyWhatsapp} onChange={() => setNotifyWhatsapp(!notifyWhatsapp)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-[#15151a] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-white/10 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Send size={14} className="text-sky-500" />
                  Notificações no Telegram
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Receba avisos do nosso Bot Oficial quando for mencionado ou receber tarefas no Telegram.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 flex-shrink-0">
                <input type="checkbox" checked={notifyTelegram} onChange={() => setNotifyTelegram(!notifyTelegram)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-[#15151a] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-white/10 peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-10">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-70">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
