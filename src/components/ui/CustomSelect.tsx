"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  avatar?: string; // Optional initials
  avatarColor?: string; // Dynamic background color
  badgeClass?: string; // Badge styling (used in older pages, preserved for compatibility)
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

export type SelectItem = SelectOption | SelectGroup;

interface CustomSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  items: SelectItem[];
  placeholder?: string;
}

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  items,
  placeholder = "Selecione...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the selected option to display its label
  let selectedLabel = placeholder;
  for (const item of items) {
    if ("options" in item) {
      const found = item.options.find((opt) => opt.value === value);
      if (found) {
        selectedLabel = found.label;
        break;
      }
    } else {
      if (item.value === value) {
        selectedLabel = item.label;
        break;
      }
    }
  }

  return (
    <div className="custom-select-container" ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        id={id}
        name={name}
        className="input w-full flex items-center justify-between text-left cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-4" style={{ color: value ? "inherit" : "inherit" }}>
          {selectedLabel}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white dark:bg-[#181824] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: "100%", left: 0 }}
        >
          {items.map((item, index) => {
            if ("options" in item) {
              return (
                <div key={index} className={index < items.length - 1 ? "mb-2" : ""}>
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {item.label}
                  </div>
                  {item.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer text-left transition-colors
                        ${value === opt.value 
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {opt.avatar && (
                          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: opt.avatarColor || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", color: "#fff", flexShrink: 0 }}>
                            {opt.avatar}
                          </div>
                        )}
                        {opt.label}
                      </div>
                  {value === opt.value && <Check size={16} />}
                    </button>
                  ))}
                </div>
              );
            } else {
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer text-left transition-colors
                    ${value === item.value 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                  onClick={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.avatar && (
                      <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: item.avatarColor || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", color: "#fff", flexShrink: 0 }}>
                        {item.avatar}
                      </div>
                    )}
                    {item.label}
                  </div>
                  {value === item.value && <Check size={16} />}
                </button>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
