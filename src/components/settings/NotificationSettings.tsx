"use client";

import { useState } from "react";
import { MessageCircle, Send, Loader2, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";

interface NotificationConfig {
  whatsappEnabled: boolean;
  whatsappApiUrl: string | null;
  whatsappApiKey: string | null;
  whatsappGroupId: string | null;
  telegramEnabled: boolean;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
}

interface NotificationSettingsProps {
  initialConfig: NotificationConfig | null;
}

export default function NotificationSettings({ initialConfig }: NotificationSettingsProps) {
  const [config, setConfig] = useState<NotificationConfig>({
    whatsappEnabled: initialConfig?.whatsappEnabled ?? false,
    whatsappApiUrl: initialConfig?.whatsappApiUrl ?? "",
    whatsappApiKey: initialConfig?.whatsappApiKey ?? "",
    whatsappGroupId: initialConfig?.whatsappGroupId ?? "",
    telegramEnabled: initialConfig?.telegramEnabled ?? false,
    telegramBotToken: initialConfig?.telegramBotToken ?? "",
    telegramChatId: initialConfig?.telegramChatId ?? "",
    dailySummaryEnabled: initialConfig?.dailySummaryEnabled ?? false,
    dailySummaryTime: initialConfig?.dailySummaryTime ?? "08:00",
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleChange(field: keyof NotificationConfig, value: string | boolean) {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/notifications", { method: "POST" });
      const data = await res.json();
      setTestResult({ ok: res.ok, msg: data.message || data.error });
    } finally {
      setTesting(false);
    }
  }

  const Toggle = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: enabled ? "var(--accent-hover)" : "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        transition: "color 0.2s",
      }}
    >
      {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* WhatsApp */}
      <div className="card" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "rgba(37,211,102,0.12)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageCircle size={18} color="#25d366" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                WhatsApp
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Via Evolution API
              </div>
            </div>
          </div>
          <Toggle
            enabled={config.whatsappEnabled}
            onChange={(v) => handleChange("whatsappEnabled", v)}
          />
        </div>

        {config.whatsappEnabled && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="alert alert-info" style={{ fontSize: "12px" }}>
              <span>
                Configure sua instância da Evolution API. A instância deve estar conectada ao WhatsApp.
                O nome da instância deve ser <strong>taskflow</strong>.
              </span>
            </div>

            <div className="form-group">
              <label className="label">URL da Evolution API</label>
              <input
                type="url"
                className="input"
                placeholder="https://sua-evolution-api.com"
                value={config.whatsappApiUrl || ""}
                onChange={(e) => handleChange("whatsappApiUrl", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">API Key</label>
              <input
                type="password"
                className="input"
                placeholder="sua-api-key-aqui"
                value={config.whatsappApiKey || ""}
                onChange={(e) => handleChange("whatsappApiKey", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">ID do Grupo WhatsApp</label>
              <input
                type="text"
                className="input"
                placeholder="120363XXXXXXXXXX@g.us"
                value={config.whatsappGroupId || ""}
                onChange={(e) => handleChange("whatsappGroupId", e.target.value)}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Formato: número@g.us para grupos ou número@s.whatsapp.net para contatos
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Telegram */}
      <div className="card" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "rgba(0,136,204,0.12)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={18} color="#0088cc" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                Telegram
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Via Bot API
              </div>
            </div>
          </div>
          <Toggle
            enabled={config.telegramEnabled}
            onChange={(v) => handleChange("telegramEnabled", v)}
          />
        </div>

        {config.telegramEnabled && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="alert alert-info" style={{ fontSize: "12px" }}>
              <span>
                1. Crie um bot com @BotFather → <code>/newbot</code>
                <br />
                2. Adicione o bot ao seu grupo/canal
                <br />
                3. Para obter o Chat ID: adicione @userinfobot ao grupo e ele enviará o ID
              </span>
            </div>

            <div className="form-group">
              <label className="label">Token do Bot</label>
              <input
                type="password"
                className="input"
                placeholder="1234567890:ABCDefghIJKlmnoPQRstuvwxyz"
                value={config.telegramBotToken || ""}
                onChange={(e) => handleChange("telegramBotToken", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label">Chat ID do Grupo</label>
              <input
                type="text"
                className="input"
                placeholder="-100XXXXXXXXXX"
                value={config.telegramChatId || ""}
                onChange={(e) => handleChange("telegramChatId", e.target.value)}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Grupos têm IDs negativos (ex: -1001234567890)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Resumo diário */}
      <div className="card" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: config.dailySummaryEnabled ? "20px" : "0",
          }}
        >
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
              ☀️ Resumo Diário Automático
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Envia um resumo de tarefas por dia nos canais ativos
            </div>
          </div>
          <Toggle
            enabled={config.dailySummaryEnabled}
            onChange={(v) => handleChange("dailySummaryEnabled", v)}
          />
        </div>

        {config.dailySummaryEnabled && (
          <div className="form-group">
            <label className="label">Horário do envio</label>
            <input
              type="time"
              className="input"
              value={config.dailySummaryTime}
              onChange={(e) => handleChange("dailySummaryTime", e.target.value)}
              style={{ maxWidth: "140px" }}
            />
          </div>
        )}
      </div>

      {/* Result */}
      {testResult && (
        <div className={`alert ${testResult.ok ? "alert-success" : "alert-error"}`}>
          {testResult.msg}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
          ) : saved ? (
            <CheckCircle size={15} />
          ) : null}
          {saved ? "Salvo!" : "Salvar Configurações"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleTest}
          disabled={testing || (!config.whatsappEnabled && !config.telegramEnabled)}
        >
          {testing ? (
            <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send size={15} />
          )}
          Testar Notificação
        </button>
      </div>
    </div>
  );
}
