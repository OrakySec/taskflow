"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Paperclip, X, Upload, File, FileText,
  FileSpreadsheet, Archive, Download, Loader2, AlertCircle,
  ZoomIn, ChevronLeft, ChevronRight, PlaySquare,
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
  taskId?: string;
  initialAttachments?: AttachmentItem[];
  onChange?: (attachments: AttachmentItem[]) => void;
  onUploaded?: (attachment: AttachmentItem) => void;
  onDeleted?: (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
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

const isMedia = (mimeType: string) => mimeType.startsWith("image/") || mimeType.startsWith("video/");

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType, size = 16 }: { mimeType: string; size?: number }) {
  const s = { size };
  if (mimeType.includes("pdf")) return <FileText {...s} style={{ color: "#ef4444" }} />;
  if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return <FileSpreadsheet {...s} style={{ color: "#22c55e" }} />;
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return <Archive {...s} style={{ color: "#f59e0b" }} />;
  return <File {...s} style={{ color: "var(--text-muted)" }} />;
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: AttachmentItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const [mounted, setMounted] = useState(false);
  const current = images[idx];

  useEffect(() => {
    setMounted(true);
  }, []);

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
        }}
      >
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
          {current.filename}
          <span style={{ marginLeft: "10px", opacity: 0.5, fontSize: "11px" }}>
            {idx + 1} / {images.length}
          </span>
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <a
            href={current.fileUrl}
            download={current.filename}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "8px",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              color: "white", textDecoration: "none", fontSize: "12px", fontWeight: 500,
            }}
          >
            <Download size={14} /> Baixar
          </a>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer", color: "white",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Media Content */}
      {current.mimeType.startsWith("video/") ? (
        <video
          src={current.fileUrl}
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "90vw", maxHeight: "80vh",
            objectFit: "contain", borderRadius: "8px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
          }}
        />
      ) : (
        <img
          src={current.fileUrl}
          alt={current.filename}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "90vw", maxHeight: "80vh",
            objectFit: "contain", borderRadius: "8px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{
              position: "absolute", left: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer", color: "white",
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{
              position: "absolute", right: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer", color: "white",
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: "16px",
            display: "flex", gap: "8px",
            padding: "8px", borderRadius: "12px",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          {images.map((img, i) => (
            img.mimeType.startsWith("video/") ? (
              <video
                key={img.id}
                src={img.fileUrl}
                onClick={() => setIdx(i)}
                style={{
                  width: "48px", height: "48px",
                  objectFit: "cover", borderRadius: "6px",
                  cursor: "pointer",
                  border: i === idx ? "2px solid #8b5cf6" : "2px solid transparent",
                  opacity: i === idx ? 1 : 0.5,
                  transition: "all 0.15s",
                }}
              />
            ) : (
              <img
                key={img.id}
                src={img.fileUrl}
                alt={img.filename}
                onClick={() => setIdx(i)}
                style={{
                  width: "48px", height: "48px",
                  objectFit: "cover", borderRadius: "6px",
                  cursor: "pointer",
                  border: i === idx ? "2px solid #8b5cf6" : "2px solid transparent",
                  opacity: i === idx ? 1 : 0.5,
                  transition: "all 0.15s",
                }}
              />
            )
          ))}
        </div>
      )}
    </div>,
    document.body
  );
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mediaAttachments = attachments.filter((a) => isMedia(a.mimeType));
  const fileAttachments = attachments.filter((a) => !isMedia(a.mimeType));

  const uploadFiles = useCallback(async (files: File[]) => {
    const newErrors: string[] = [];
    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        newErrors.push(`${f.name}: tipo não suportado.`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        newErrors.push(`${f.name}: excede 20 MB.`);
        return false;
      }
      return true;
    });
    setErrors(newErrors);
    if (valid.length === 0) return;

    setUploading(true);
    for (const file of valid) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Falha no upload.");
        const { fileUrl, filename, fileSize, mimeType } = upData.files[0];

        let newAttachment: AttachmentItem;

        if (taskId) {
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={mediaAttachments}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

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
              Imagens, PDF, Excel, Word, ZIP — máx. 20 MB
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

      {/* ── Grid de Mídia (Imagens/Vídeos) ── */}
      {mediaAttachments.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "8px",
        }}>
          {mediaAttachments.map((att, i) => (
            <div
              key={att.id}
              style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", overflow: "hidden", background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              {/* Thumbnail */}
              {att.mimeType.startsWith("video/") ? (
                <>
                  <video
                    src={att.fileUrl}
                    style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in", display: "block" }}
                  />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", pointerEvents: "none" }}>
                    <PlaySquare size={28} color="white" opacity={0.8} />
                  </div>
                </>
              ) : (
                <img
                  src={att.fileUrl}
                  alt={att.filename}
                  onClick={() => setLightboxIndex(i)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in", display: "block" }}
                />
              )}

              {/* Hover overlay */}
              <div
                onClick={() => setLightboxIndex(i)}
                style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0, transition: "opacity 0.15s", cursor: "zoom-in",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >
                <ZoomIn size={22} color="white" />
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(att)}
                style={{
                  position: "absolute", top: "4px", right: "4px",
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)", border: "none",
                  cursor: "pointer", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                title="Remover"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Lista de arquivos não-imagem ── */}
      {fileAttachments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {fileAttachments.map((att) => (
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
