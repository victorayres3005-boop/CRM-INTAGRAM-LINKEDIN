"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, LogOut, Database, CheckCircle2, AlertCircle,
  Loader2, ExternalLink, Copy, Check, Briefcase,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const GOALFY_BOARD_ID = "9583bd08-77ad-4821-b19f-c35148f6439a";
const GOALFY_BOARD_NAME = "Solicitação de Cadastro";

type Health = {
  status: "checking" | "ok" | "error";
  cadastros?: number;
  errorMsg?: string;
  latencyMs?: number;
};

export function ConfiguracoesClient({
  email,
  userId,
}: {
  email: string | null;
  userId: string | null;
}) {
  const router = useRouter();
  const [health, setHealth] = useState<Health>({ status: "checking" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t0 = performance.now();
    fetch("/api/gerentes")
      .then(async (r) => {
        const data = await r.json();
        const latencyMs = Math.round(performance.now() - t0);
        if (r.ok && Array.isArray(data?.cadastros)) {
          setHealth({ status: "ok", cadastros: data.cadastros.length, latencyMs });
        } else {
          setHealth({ status: "error", errorMsg: data?.error ?? `HTTP ${r.status}` });
        }
      })
      .catch((e) => setHealth({ status: "error", errorMsg: String(e?.message ?? e) }));
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(GOALFY_BOARD_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const initials = (email?.split("@")[0] ?? "CF").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl space-y-4 fade-stagger">
      {/* Perfil */}
      <section className="cf-card overflow-hidden">
        <header className="px-5 py-3 border-b border-cf-border flex items-center gap-2">
          <User size={14} className="text-cf-navy" />
          <h2 className="text-sm font-semibold text-cf-text1">Perfil</h2>
        </header>

        <div className="px-5 py-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cf-green to-cf-green-dark flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-cf-text1 truncate">
              {email ? email.split("@")[0] : "Usuário"}
            </p>
            <p className="text-xs text-cf-text3 flex items-center gap-1.5 mt-0.5 truncate">
              <Mail size={11} /> {email ?? "—"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-cf-danger border border-cf-danger/20 bg-white hover:bg-cf-danger/5 transition-colors"
          >
            <LogOut size={12} /> Sair
          </button>
        </div>

        {userId && (
          <div className="px-5 py-2.5 bg-cf-bg border-t border-cf-border text-[10px] text-cf-text3 font-mono truncate">
            ID: {userId}
          </div>
        )}
      </section>

      {/* Integração Goalfy */}
      <section className="cf-card overflow-hidden">
        <header className="px-5 py-3 border-b border-cf-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-cf-navy" />
            <h2 className="text-sm font-semibold text-cf-text1">Integração Goalfy</h2>
          </div>
          <StatusPill health={health} />
        </header>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <Briefcase size={14} className="text-cf-text3 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-cf-text3 font-semibold">
                Board origem
              </p>
              <p className="text-sm text-cf-text1 mt-0.5">{GOALFY_BOARD_NAME}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <code className="text-[10px] text-cf-text3 font-mono bg-cf-bg px-2 py-1 rounded border border-cf-border truncate">
                  {GOALFY_BOARD_ID}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-cf-text3 hover:text-cf-navy transition-colors"
                  title="Copiar board ID"
                >
                  {copied ? (
                    <>
                      <Check size={10} className="text-cf-green" /> copiado
                    </>
                  ) : (
                    <>
                      <Copy size={10} /> copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cf-border">
            <Stat
              label="Cadastros sincronizados"
              value={
                health.status === "ok"
                  ? health.cadastros?.toLocaleString("pt-BR") ?? "—"
                  : health.status === "checking"
                  ? "..."
                  : "—"
              }
            />
            <Stat
              label="Latência"
              value={
                health.status === "ok" && health.latencyMs !== undefined
                  ? `${health.latencyMs}ms`
                  : health.status === "checking"
                  ? "..."
                  : "—"
              }
            />
          </div>

          {health.status === "error" && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-cf-danger/5 border border-cf-danger/20 text-xs text-cf-danger">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Falha ao consultar Goalfy</p>
                <p className="text-[11px] opacity-80">{health.errorMsg}</p>
              </div>
            </div>
          )}

          <a
            href="https://app.goalfy.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cf-navy hover:text-cf-navy-dark font-medium"
          >
            Abrir Goalfy <ExternalLink size={11} />
          </a>
        </div>
      </section>

      {/* Sobre */}
      <section className="cf-card px-5 py-4">
        <p className="text-[10px] uppercase tracking-widest text-cf-text3 font-semibold">
          Sobre
        </p>
        <p className="text-xs text-cf-text2 mt-1.5">
          Plataforma operacional de crédito · Capital Finanças
        </p>
        <p className="text-[11px] text-cf-text3 mt-0.5">
          Dados de cadastro vêm do Goalfy. Autenticação via Supabase. Hospedado no Vercel.
        </p>
      </section>
    </div>
  );
}

function StatusPill({ health }: { health: Health }) {
  if (health.status === "checking") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-cf-text3 bg-cf-bg border border-cf-border rounded-full px-2 py-0.5">
        <Loader2 size={10} className="animate-spin" /> verificando...
      </span>
    );
  }
  if (health.status === "ok") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-cf-green-dark bg-cf-green-pale border border-cf-green/30 rounded-full px-2 py-0.5">
        <CheckCircle2 size={10} /> Conectado
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-cf-danger bg-cf-danger/5 border border-cf-danger/20 rounded-full px-2 py-0.5">
      <AlertCircle size={10} /> Erro
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-cf-text3 font-semibold">
        {label}
      </p>
      <p className="cf-metric text-lg text-cf-text1 leading-tight mt-0.5">{value}</p>
    </div>
  );
}
