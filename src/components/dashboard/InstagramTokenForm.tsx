"use client";

import { useState } from "react";
import { RefreshCw, Save, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function InstagramTokenForm({ isConnected }: { isConnected: boolean }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    if (!token.trim()) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/instagram/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();

    if (data.success) {
      setMessage({ type: "success", text: `Conta @${data.username} conectada! Clique em Sincronizar para importar os dados.` });
      setToken("");
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setMessage({ type: "error", text: data.error });
    }
    setLoading(false);
  }

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    const res = await fetch("/api/instagram/sync", { method: "POST" });
    const data = await res.json();

    if (data.error) {
      setMessage({ type: "error", text: data.error });
    } else {
      const total = data.results?.reduce((acc: number, r: { posts?: number }) => acc + (r.posts ?? 0), 0);
      setMessage({ type: "success", text: `Sincronizado! ${total} posts importados.` });
    }
    setSyncing(false);
  }

  async function handleDisconnect() {
    if (!confirm("Desconectar o Instagram? Os dados já importados serão mantidos.")) return;
    await fetch("/api/instagram/token", { method: "DELETE" });
    window.location.reload();
  }

  if (isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 bg-cf-navy text-white text-sm font-medium rounded-xl transition-colors",
              syncing ? "opacity-60 cursor-not-allowed" : "hover:bg-cf-navy/90"
            )}
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sincronizando..." : "Sincronizar Agora"}
          </button>

          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-cf-navy/50 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Trash2 size={15} />
            Desconectar
          </button>
        </div>

        {message && (
          <p className={cn("text-xs", message.type === "error" ? "text-red-500" : "text-green-600")}>
            {message.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-cf-navy/60">
          Cole seu Access Token do Instagram
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="IGQVJ..."
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cf-navy/20 focus:border-cf-navy/40 font-mono"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={loading || !token.trim()}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 bg-cf-navy text-white text-sm font-medium rounded-xl transition-colors",
            loading || !token.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-cf-navy/90"
          )}
        >
          <Save size={15} />
          {loading ? "Validando..." : "Salvar Token"}
        </button>

        <a
          href="https://developers.facebook.com/tools/explorer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cf-navy/50 hover:text-cf-navy transition-colors"
        >
          <ExternalLink size={13} />
          Gerar token no Graph API Explorer
        </a>
      </div>

      {message && (
        <p className={cn("text-xs", message.type === "error" ? "text-red-500" : "text-green-600")}>
          {message.text}
        </p>
      )}
    </div>
  );
}
