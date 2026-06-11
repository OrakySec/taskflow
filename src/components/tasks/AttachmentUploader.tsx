"use client";

import { useState, useRef, useCallback } from "react";
import {
  Paperclip, X, Upload, File, FileImage, FileText,
  FileSpreadsheet, Archive, Download, Loader2, AlertCircle,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface AttachmentItem {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface Props {
  taskId?: string;                          // se undefined, modo "pré-criação"
  initialAttachments?: AttachmentItem[];
  onChange?: (attachments: AttachmentItem[]) => void; // modo pré-criação
  onUploaded?: (attachment: AttachmentItem) => void;  // modo tarefa existente
  onDeleted?: (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/csv", "application/json",
  "application/zip", "application/x-rar-compressed",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const s = { size: 16 };
  if (mimeType.startsWith("image/")) return <FileImage {...s} style={{ color: "#8b5cf6" }} />;
  if (mimeType.includes("pdf")) return <FileText {...s} style={{ color: "#ef4444" }} />;
  if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return <FileSpreadsheet {...s} style={{ color: "#22c55e" }} />;
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return <Archive {...s} style={{ color: "#f59e0b" }} />;
  return <File {...s} style={{ color: "var(--text-muted)" }} />;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AttachmentUploader({
  taskId,
  initialAttachments = [],
  onChange,
  onUploaded,
  onDeleted,
}: Props) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: File[]) => {
    const newErrors: string[] = [];
    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        newErrors.push(`${f.name}: tipo não suportado.`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        newErrors.push(`${f.name}: excede 10 MB.`);
        return false;
      }
      return true;
    });
    setErrors(newErrors);
    if (valid.length === 0) return;

    setUploading(true);
    for (const file of valid) {
      try {
        // 1. Faz upload para o MinIO
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Falha no upload.");
        const { fileUrl, filename, fileSize, mimeType } = upData.files[0];

        let newAttachment: AttachmentItem;

        if (taskId) {
          // 2a. Tarefa existente → salva no banco imediatamente
          const saveRes = await fetch("/api/attachments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, filename, fileUrl, fileSize, mimeType }),
          });
          const saved = await saveRes.json();
          if (!saveRes.ok) throw new Error(saved.error || "Falha ao salvar.");
          newAttachment = saved;
          onUploaded?.(newAttachment);
        } else {
          // 2b. Tarefa nova → guarda em memória, pai salva depois
          newAttachment = { id: `pending-${Date.now()}-${Math.random()}`, filename, fileUrl, fileSize, mimeType };
        }

        setAttachments((prev) => {
          const next = [...prev, newAttachment];
          onChange?.(next);
          return next;
        });
      } catch (err: unknown) {
        setErrors((prev) => [...prev, (err as Error).message]);
      }
    }
    setUploading(false);
  }, [taskId, onChange, onUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  }, [uploadFiles]);

  const handleDelete = async (attachment: AttachmentItem) => {
    if (taskId && !attachment.id.startsWith("pending-")) {
      await fetch(`/api/attachments/${attachment.id}`, { method: "DELETE" });
      onDeleted?.(attachment.id);
    }
    setAttachments((prev) => {
      const next = prev.filter((a) => a.id !== attachment.id);
      onChange?.(next);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragOver ? "var(--accent-subtle)" : "var(--bg-primary)",
          transition: "all 0.15s",
          opacity: uploading ? 0.7 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={(e) => e.target.files && uploadFiles(Array.from(e.target.files))}
        />
        {uploading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--text-muted)" }}>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "13px" }}>Enviando...</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <Upload size={22} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
              Arraste arquivos ou clique para selecionar
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Imagens, PDF, Excel, Word, ZIP — máx. 100 MB
            </span>
          </div>
        )}
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {errors.map((err, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#ef4444" }}>
              <AlertCircle size={12} /> {err}
            </div>
          ))}
        </div>
      )}

      {/* Lista de anexos */}
      {attachments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 12px", borderRadius: "8px",
                background: "var(--bg-primary)", border: "1px solid var(--border)",
              }}
            >
              <FileIcon mimeType={att.mimeType} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {att.filename}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {formatBytes(att.fileSize)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                {!att.id.startsWith("pending-") && (
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.filename}
                    style={{ display: "flex", alignItems: "center", padding: "4px", borderRadius: "6px", color: "var(--text-muted)", textDecoration: "none" }}
                    title="Baixar"
                  >
                    <Download size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(att)}
                  style={{ display: "flex", alignItems: "center", padding: "4px", borderRadius: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  title="Remover"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
          <Paperclip size={12} /> Nenhum arquivo anexado
        </div>
      )}
    </div>
  );
}
