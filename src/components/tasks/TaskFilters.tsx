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
    <div className="flex flex-wrap gap-3 mb-6 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px] w-full md:w-auto">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
        <input
          type="text"
          className="input pl-9"
          placeholder="Buscar tarefa..."
          defaultValue={currentParams.q || ""}
          onChange={(e) => {
            clearTimeout((window as unknown as { _searchTimeout: ReturnType<typeof setTimeout> | undefined })._searchTimeout);
            (window as unknown as { _searchTimeout: ReturnType<typeof setTimeout> | undefined })._searchTimeout = setTimeout(() => {
              updateFilter("q", e.target.value);
            }, 400);
          }}
        />
      </div>

      {/* Status filter */}
      <select
        className="select flex-none w-full md:w-auto min-w-[160px]"
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
        className="select flex-none w-full md:w-auto min-w-[180px]"
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
          className="select flex-none w-full md:w-auto min-w-[180px]"
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
          className="select flex-none w-full md:w-auto min-w-[160px]"
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
          className="btn btn-ghost btn-sm w-full md:w-auto flex items-center justify-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          onClick={clearAll}
        >
          <X size={13} />
          Limpar
        </button>
      )}
    </div>
  );
}
