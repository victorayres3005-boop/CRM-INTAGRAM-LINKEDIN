"use client";

import { useState } from "react";
import { RefreshCw, Link, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

export function InstagramConnectButton({
  isConnected,
}: {
  isConnected: boolean;
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setSyncResult(`Erro: ${data.error}`);
      } else {
        const total = data.results?.reduce(
          (acc: number, r: { posts?: number }) => acc + (r.posts ?? 0),
          0
        );
        setSyncResult(`Sincronizado! ${total} posts atualizados.`);
      }
    } catch {
      setSyncResult("Erro ao sincronizar. Tente novamente.");
    } finally {
      setSyncing(false);
    }
  }

  if (!isConnected) {
    return (
      <a
        href="/api/instagram/auth"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-cf-navy text-white text-sm font-medium rounded-xl hover:bg-cf-navy/90 transition-colors"
      >
        <Link size={15} />
        Conectar Instagram
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 bg-cf-navy text-white text-sm font-medium rounded-xl transition-colors",
          syncing
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-cf-navy/90"
        )}
      >
        <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Sincronizando..." : "Sincronizar Agora"}
      </button>

      <a
        href="/api/instagram/auth"
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-cf-navy/60 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
      >
        <Unlink size={15} />
        Reconectar
      </a>

      {syncResult && (
        <p
          className={cn(
            "text-xs w-full mt-1",
            syncResult.startsWith("Erro") ? "text-red-500" : "text-green-600"
          )}
        >
          {syncResult}
        </p>
      )}
    </div>
  );
}
