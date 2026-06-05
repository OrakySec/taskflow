"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";

interface TaskFiltersProps {
  users: { id: string; name: string }[];
  clients: { id: string; name: string }[];
  currentParams: Record<string, string | undefined>;
  isAdmin: boolean;
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "OPEN", label: "Aberta" },
  { value: "IN_PROGRESS", label: "Em Andamento" },
  { value: "DONE", label: "Concluída" },
  { value: "FAILED", label: "Falhou" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "Todas as prioridades" },
  { value: "URGENT", label: "🔴 Urgente" },
  { value: "HIGH", label: "🟠 Alta" },
  { value: "MEDIUM", label: "🟡 Média" },
  { value: "LOW", label: "🟢 Baixa" },
];

export default function TaskFilters({
  users,
  clients,
  currentParams,
  isAdmin,
}: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters = Object.values(currentParams).some(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "24px",
        alignItems: "center",
      }}
    >
      {/* Search */}
      <div className="w-full-mobile" style={{ position: "relative", flex: "1 1 200px", maxWidth: "300px" }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
          }}
        />
        <input
          type="text"
          className="input"
          placeholder="Buscar tarefa..."
          defaultValue={currentParams.q || ""}
          onChange={(e) => {
            clearTimeout((window as unknown as { _searchTimeout: ReturnType<typeof setTimeout> | undefined })._searchTimeout);
            (window as unknown as { _searchTimeout: ReturnType<typeof setTimeout> | undefined })._searchTimeout = setTimeout(() => {
              updateFilter("q", e.target.value);
            }, 400);
          }}
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {/* Status filter */}
      <select
        className="select w-full-mobile"
        style={{ flex: "0 0 auto", width: "auto", minWidth: "160px" }}
        value={currentParams.status || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        className="select w-full-mobile"
        style={{ flex: "0 0 auto", width: "auto", minWidth: "180px" }}
        value={currentParams.priority || ""}
        onChange={(e) => updateFilter("priority", e.target.value)}
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Assigned to filter (admin only) */}
      {isAdmin && users.length > 0 && (
        <select
          className="select w-full-mobile"
          style={{ flex: "0 0 auto", width: "auto", minWidth: "180px" }}
          value={currentParams.assignedTo || ""}
          onChange={(e) => updateFilter("assignedTo", e.target.value)}
        >
          <option value="">Todos os responsáveis</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      )}

      {/* Client filter */}
      {clients.length > 0 && (
        <select
          className="select w-full-mobile"
          style={{ flex: "0 0 auto", width: "auto", minWidth: "160px" }}
          value={currentParams.clientId || ""}
          onChange={(e) => updateFilter("clientId", e.target.value)}
        >
          <option value="">Todos os clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          className="btn btn-ghost btn-sm w-full-mobile"
          onClick={clearAll}
          style={{ gap: "4px", color: "var(--text-muted)", justifyContent: "center" }}
        >
          <X size={13} />
          Limpar
        </button>
      )}
    </div>
  );
}
