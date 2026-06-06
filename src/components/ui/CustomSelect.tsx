"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  avatar?: string; // Optional initials
  avatarColor?: string; // Dynamic background color
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
        className="input"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          background: "var(--bg-secondary)",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel}
        </span>
        <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            maxHeight: "300px",
            overflowY: "auto",
            padding: "4px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {items.map((item, index) => {
            if ("options" in item) {
              return (
                <div key={index} style={{ marginBottom: index < items.length - 1 ? "8px" : 0 }}>
                  <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                    {item.label}
                  </div>
                  {item.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "10px 12px",
                        background: value === opt.value ? "var(--accent-subtle)" : "transparent",
                        color: value === opt.value ? "var(--accent-hover)" : "var(--text-primary)",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "14px",
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (value !== opt.value) e.currentTarget.style.background = "var(--bg-secondary)";
                      }}
                      onMouseLeave={(e) => {
                        if (value !== opt.value) e.currentTarget.style.background = "transparent";
                      }}
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "10px 12px",
                    background: value === item.value ? "var(--accent-subtle)" : "transparent",
                    color: value === item.value ? "var(--accent-hover)" : "var(--text-primary)",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    transition: "background 0.1s, color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (value !== item.value) e.currentTarget.style.background = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (value !== item.value) e.currentTarget.style.background = "transparent";
                  }}
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
