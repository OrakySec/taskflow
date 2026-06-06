"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

export default function ClientRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let attachments: any[] = [];

      // 1. Upload dos arquivos (se houver)
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => formData.append("file", file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Erro ao fazer upload dos anexos.");
        }

        const uploadData = await uploadRes.json();
        attachments = uploadData.files; // [{ filename, fileUrl, fileSize, mimeType }]
      }

      // 2. Criar a tarefa (rascunho)
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          deadline: deadline || null,
          attachments,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar solicitação.");
      }

      // Sucesso
      setTitle("");
      setDescription("");
      setDeadline("");
      setFiles([]);
      if (onSuccess) onSuccess();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a24] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nova Solicitação</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Preencha os dados abaixo para solicitar uma nova demanda para a agência.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nova campanha de Dia das Mães"
            className="w-full bg-gray-50 dark:bg-[#13131a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8b5cf6] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição Detalhada</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o que você precisa que seja feito..."
            className="w-full bg-gray-50 dark:bg-[#13131a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8b5cf6] outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo Desejado (Opcional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-gray-50 dark:bg-[#13131a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8b5cf6] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anexos (Imagens, PDFs, etc)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl relative hover:border-[#8b5cf6] transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#8b5cf6] hover:text-[#7c3aed] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#8b5cf6]">
                  <span>Selecione os arquivos</span>
                  <input type="file" multiple className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">Qualquer formato até 50MB</p>
            </div>
          </div>
          
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, i) => (
                <li key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#13131a] border border-gray-100 dark:border-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[80%]">{file.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Solicitação"
          )}
        </button>
      </div>
    </form>
  );
}
