"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2, XCircle, Clock, TrendingUp,
  RefreshCw, FileSpreadsheet, AlertCircle, Mail, Phone, BadgeCheck, X,
  Hash, Calendar, Timer, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import type { Cadastro, GerenteInfo } from "@/app/api/gerentes/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ETAPAS_ATIVADO   = new Set(["Ativado"]);
const ETAPAS_LIBERADO  = new Set(["Liberado"]);
const ETAPAS_APROVADO  = new Set(["Aprovado"]);
const ETAPAS_NEGATIVAS = new Set(["Negado", "Negado (pré)", "Cancelado"]);
const ETAPAS_POSITIVAS = new Set(["Ativado", "Liberado", "Aprovado"]);

function getMes(data: string | null) {
  return data ? data.slice(0, 7) : null;
}

function mesLabel(mes: string) {
  const m: Record<string, string> = {
    "2026-01": "Jan", "2026-02": "Fev", "2026-03": "Mar", "2026-04": "Abr",
    "2026-05": "Mai", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Ago",
    "2026-09": "Set", "2026-10": "Out", "2026-11": "Nov", "2026-12": "Dez",
  };
  return m[mes] ?? mes;
}

function etapaColor(etapa: string): string {
  if (ETAPAS_ATIVADO.has(etapa))   return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (ETAPAS_LIBERADO.has(etapa))  return "bg-green-100 text-green-700 border-green-200";
  if (ETAPAS_APROVADO.has(etapa))  return "bg-violet-50 text-violet-700 border-violet-200";
  if (ETAPAS_NEGATIVAS.has(etapa)) return "bg-red-50 text-red-600 border-red-200";
  return "bg-blue-50 text-blue-700 border-blue-100";
}

function diasDesde(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr + "T12:00:00").getTime()) / 86_400_000);
}

const AVATAR_COLORS = [
  ["#203b88", "#e8edf8"],
  ["#73b815", "#eef7dc"],
  ["#1a4fa8", "#dde8f7"],
  ["#0e7490", "#d0f0f7"],
  ["#7c3aed", "#ede9fe"],
  ["#b45309", "#fef3c7"],
  ["#be123c", "#ffe4e6"],
  ["#0f766e", "#d1fae5"],
];

function avatarColor(nome: string) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatPhone(raw: string): string {
  if (!raw || raw === "N/A") return "";
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return raw;
}

const APELIDO_FOTO: Record<string, string> = {
  "gleyson":         "Gleyson Azevedo",
  "celio":           "Célio",
  "célio":           "Célio",
  "caio":            "Caio",
  "dalva":           "Dalva",
  "hernani":         "Hernani",
  "keyla":           "Keyla",
  "luiz carlos":     "Luiz Carlos",
  "magno":           "Magno",
  "rogério":         "Rogério",
  "rogerio":         "Rogério",
  "nex":             "Nex",
  "antecipa":        "Antecipa",
  "guilherme":       "Guilherme (Nexus)",
  "cecilia":         "Cecilia Guedes",
  "cecília":         "Cecilia Guedes",
  "cecilia guedes":  "Cecilia Guedes",
  "cecília guedes":  "Cecilia Guedes",
};

function fotoNome(nome: string): string {
  return APELIDO_FOTO[nome.toLowerCase()] ?? nome;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

const PHOTO_EXTS = [".png", ".jpg", ".jpeg"];

function AvatarGerente({ nome, size = 48, className }: { nome: string; size?: number; className?: string }) {
  const [extIdx, setExtIdx] = useState(0);
  const [color, bg] = avatarColor(nome);
  const fileName = fotoNome(nome);
  const hasPhoto = extIdx < PHOTO_EXTS.length;
  const src = hasPhoto ? `/gerentes/${encodeURIComponent(fileName)}${PHOTO_EXTS[extIdx]}` : "";

  return (
    <div
      className={cn("rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold select-none", className)}
      style={{ width: size, height: size, background: hasPhoto ? "transparent" : bg }}
    >
      {hasPhoto ? (
        <Image
          src={src}
          alt={nome}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          onError={() => setExtIdx((i) => i + 1)}
        />
      ) : (
        <span style={{ color, fontSize: size * 0.35 }}>{initials(nome)}</span>
      )}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function BrandTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cf-surface shadow-cf-lg rounded-xl px-3 py-2.5 min-w-[120px]">
      <p className="text-xs font-semibold text-cf-text2 mb-1.5 pb-1.5 border-b border-cf-surface">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color ?? p.fill }} />
          <span className="text-xs font-semibold cf-metric text-cf-text1">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Modal de cadastro ─────────────────────────────────────────────────────────

function CadastroModal({ cadastro, onClose }: { cadastro: Cadastro; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const dias = diasDesde(cadastro.dataEntrada);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-cf-navy to-cf-navy/80 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/50 uppercase tracking-wider mb-1">Cadastro</p>
              <h2 className="text-base font-bold text-white leading-snug">{cadastro.nomeGrupo}</h2>
              {cadastro.etapaReal && cadastro.etapaReal !== "—" && (
                <p className="mt-2 text-[11px] text-white/70">
                  <span className="text-white/40">Etapa atual:</span> {cadastro.etapaReal}
                </p>
              )}
              <div className="mt-2">
                <span className={cn(
                  "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                  etapaColor(cadastro.etapaFunil)
                )}>
                  {cadastro.etapaFunil}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white mt-0.5"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Dias desde entrada — destaque */}
        <div className={cn(
          "mx-6 mt-5 flex items-center gap-3 p-3.5 rounded-xl border",
          dias > 30 ? "bg-red-50 border-red-200" :
          dias > 14 ? "bg-amber-50 border-amber-200" :
                      "bg-cf-bg border-cf-surface"
        )}>
          <Timer size={16} className={cn(
            dias > 30 ? "text-red-500" : dias > 14 ? "text-amber-600" : "text-cf-text3"
          )} />
          <div>
            <p className={cn(
              "cf-metric text-xl font-bold",
              dias > 30 ? "text-red-500" : dias > 14 ? "text-amber-600" : "text-cf-text2"
            )}>
              {dias} dias
            </p>
            <p className="text-[11px] text-cf-text3 mt-0.5">desde a entrada</p>
          </div>
          {dias > 30 && (
            <span className="ml-auto text-[10px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              Atenção
            </span>
          )}
        </div>

        {/* Detalhes */}
        <div className="px-6 py-5 space-y-3">
          {[
            {
              icon: User,
              label: "Gerente",
              content: (
                <div className="flex items-center gap-2">
                  <AvatarGerente nome={cadastro.gerente || "?"} size={22} />
                  <span className="text-xs font-medium text-cf-text1">{cadastro.gerente || "—"}</span>
                </div>
              ),
            },
            {
              icon: Hash,
              label: "CNPJ",
              content: <span className="text-xs font-medium text-cf-text1 font-mono">{cadastro.cliente || "Não informado"}</span>,
            },
            {
              icon: Calendar,
              label: "Data de entrada",
              content: (
                <span className="text-xs font-medium text-cf-text1">
                  {cadastro.dataEntrada
                    ? new Date(cadastro.dataEntrada + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                    : "—"}
                </span>
              ),
            },
          ].map(({ icon: Icon, label, content }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cf-bg border border-cf-surface flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={13} className="text-cf-navy/60" />
              </div>
              <div>
                <p className="text-[10px] text-cf-text3 uppercase tracking-wide">{label}</p>
                <div className="mt-0.5">{content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Card de gerente ───────────────────────────────────────────────────────────

function CardGerente({
  info, stats, idx, onClick,
}: {
  info: GerenteInfo;
  stats: { total: number; ativados: number; liberados: number; aprovados: number; negados: number; emAnalise: number; taxa: number };
  idx: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cf-card flex flex-col hover:shadow-cf-lg hover:-translate-y-0.5 transition-all duration-200 animate-fade-in overflow-hidden cursor-pointer hover:ring-2 hover:ring-cf-navy/20 active:scale-[0.98]"
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 bg-gradient-to-br from-cf-navy/[0.04] to-transparent border-b border-cf-surface">
        <AvatarGerente nome={info.nome} size={48} className="ring-2 ring-white shadow" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-cf-text1 truncate leading-tight">{info.nome}</p>
          {info.exclusividade ? (
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-cf-navy/10 text-cf-navy leading-none">
              {info.exclusividade}
            </span>
          ) : (
            <p className="text-[11px] text-cf-text3 mt-0.5">Gerente Comercial</p>
          )}
        </div>
      </div>

      <div className="px-5 py-4 flex-1">
        <div className="grid grid-cols-3 gap-2 text-center mb-2">
          <div className="bg-cf-bg rounded-lg py-2 px-1">
            <p className="cf-metric text-base text-cf-text1">{stats.total}</p>
            <p className="text-[10px] text-cf-text3 mt-0.5">Total</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg py-2 px-1">
            <p className="cf-metric text-base text-emerald-600">{stats.ativados}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">Ativados</p>
          </div>
          <div className="bg-cf-navy/[0.06] rounded-lg py-2 px-1">
            <p className="cf-metric text-base text-cf-navy">{stats.taxa}%</p>
            <p className="text-[10px] text-cf-text3 mt-0.5">Conv.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="bg-amber-50 border border-amber-100 rounded-lg py-1.5 px-1">
            <p className="cf-metric text-sm text-amber-600">{stats.emAnalise}</p>
            <p className="text-[10px] text-amber-500 mt-0.5">Em Anál.</p>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-lg py-1.5 px-1">
            <p className="cf-metric text-sm text-violet-600">{stats.aprovados}</p>
            <p className="text-[10px] text-violet-500 mt-0.5">Aprov.</p>
          </div>
          <div className="bg-cf-green-pale border border-cf-green/20 rounded-lg py-1.5 px-1">
            <p className="cf-metric text-sm text-cf-green">{stats.liberados}</p>
            <p className="text-[10px] text-cf-text3 mt-0.5">Liberados</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg py-1.5 px-1">
            <p className="cf-metric text-sm text-red-500">{stats.negados}</p>
            <p className="text-[10px] text-red-400 mt-0.5">Cancel.</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-cf-surface bg-cf-bg/40 flex items-center justify-center gap-1.5">
        <span className="text-[10px] text-cf-text3">Ver detalhes</span>
        <span className="text-[10px] text-cf-navy/40">→</span>
      </div>
    </div>
  );
}

// ── Modal de gerente ──────────────────────────────────────────────────────────

function GerenteModal({
  info, stats, cadastros, onClose, onSelectCadastro,
}: {
  info: GerenteInfo;
  stats: { total: number; ativados: number; liberados: number; aprovados: number; negados: number; emAnalise: number; taxa: number };
  cadastros: Cadastro[];
  onClose: () => void;
  onSelectCadastro: (c: Cadastro) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const porEtapa = Array.from(
    cadastros.reduce((m, c) => {
      m.set(c.etapaFunil, (m.get(c.etapaFunil) ?? 0) + 1);
      return m;
    }, new Map<string, number>())
  ).map(([etapa, count]) => ({ etapa, count })).sort((a, b) => b.count - a.count);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="bg-gradient-to-br from-cf-navy to-cf-navy/80 px-6 py-5 flex items-center gap-4 shrink-0">
          <AvatarGerente nome={info.nome} size={64} className="ring-2 ring-white/30 shadow-lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{info.nome}</h2>
            {info.exclusividade && (
              <span className="inline-block mt-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/15 text-white/80">
                {info.exclusividade}
              </span>
            )}
            <div className="flex flex-wrap gap-3 mt-2.5">
              {info.supervisor && (
                <span className="text-[11px] text-white/60">
                  Supervisor: <span className="text-white/90 font-medium">{info.supervisor}</span>
                </span>
              )}
              {info.email && (
                <a href={`mailto:${info.email.split(";")[0].trim()}`}
                  className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <Mail size={11} />
                  {info.email.split(";")[0].trim()}
                </a>
              )}
              {formatPhone(info.telefone) && (
                <a href={`tel:${info.telefone}`}
                  className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <Phone size={11} />
                  {formatPhone(info.telefone)}
                </a>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-7 divide-x divide-cf-surface border-b border-cf-surface shrink-0">
          {[
            { label: "Total",      value: stats.total,      color: "text-cf-text1"    },
            { label: "Em Análise", value: stats.emAnalise,  color: "text-amber-600"   },
            { label: "Aprovados",  value: stats.aprovados,  color: "text-violet-600"  },
            { label: "Liberados",  value: stats.liberados,  color: "text-cf-green"    },
            { label: "Ativados",   value: stats.ativados,   color: "text-emerald-600" },
            { label: "Cancelados", value: stats.negados,    color: "text-red-500"     },
            { label: "Conversão",  value: `${stats.taxa}%`, color: "text-cf-navy"     },
          ].map(({ label, value, color }) => (
            <div key={label} className="py-3 px-4 text-center bg-cf-bg/30">
              <p className={cn("cf-metric text-xl font-bold", color)}>{value}</p>
              <p className="text-[10px] text-cf-text3 mt-0.5 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Corpo scrollável */}
        <div className="overflow-y-auto flex-1">
          {/* Mini-gráfico */}
          {porEtapa.length > 0 && (
            <div className="px-6 pt-5 pb-4 border-b border-cf-surface">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3.5 rounded-full bg-cf-navy shrink-0" />
                <p className="text-xs font-semibold text-cf-text2">Cadastros por Etapa</p>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(80, porEtapa.length * 28)}>
                <BarChart data={porEtapa} layout="vertical" barSize={12}>
                  <defs>
                    <linearGradient id="mgNavy" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#203b88" stopOpacity={1} />
                      <stop offset="100%" stopColor="#1a4fa8" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="etapa" type="category" tick={{ fontSize: 10, fill: "#374151" }} width={110} axisLine={false} tickLine={false} />
                  <Tooltip content={<BrandTooltip />} />
                  <Bar dataKey="count" fill="url(#mgNavy)" radius={[0, 4, 4, 0]} name="Cadastros" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabela de cadastros — clicável */}
          <div>
            <div className="px-6 py-3.5 border-b border-cf-surface bg-cf-bg/40 flex items-center gap-2">
              <div className="w-1 h-3.5 rounded-full bg-cf-green shrink-0" />
              <p className="text-xs font-semibold text-cf-text2">
                Todos os Cadastros
                <span className="ml-1.5 font-normal text-cf-text3">({cadastros.length})</span>
              </p>
              <span className="ml-auto text-[10px] text-cf-text3 italic">Clique para ver detalhes</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cf-surface">
                  <th className="px-6 py-2.5 text-left font-semibold text-cf-text3 uppercase tracking-wide">Empresa</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-cf-text3 uppercase tracking-wide">Etapa Real</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-cf-text3 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-cf-text3 uppercase tracking-wide">Entrada</th>
                </tr>
              </thead>
              <tbody>
                {cadastros
                  .sort((a, b) => {
                    if (!a.dataEntrada) return 1;
                    if (!b.dataEntrada) return -1;
                    return b.dataEntrada.localeCompare(a.dataEntrada);
                  })
                  .map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCadastro(c)}
                      className="border-b border-cf-surface/60 hover:bg-cf-bg/60 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-2.5 font-medium text-cf-text1 max-w-[240px] truncate">{c.nomeGrupo}</td>
                      <td className="px-4 py-2.5 text-cf-text2 max-w-[180px]">
                        <span className="block truncate" title={c.etapaReal}>{c.etapaReal}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("px-2 py-0.5 rounded-full font-medium text-[11px] border", etapaColor(c.etapaFunil))}>
                          {c.etapaFunil}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-cf-text3">
                        {c.dataEntrada
                          ? new Date(c.dataEntrada + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                {cadastros.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-cf-text3">
                      Nenhum cadastro encontrado para este gerente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function GerentesPage() {
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [gerentes, setGerentes] = useState<GerenteInfo[]>([]);
  const [meta, setMeta] = useState<{ fileName: string; updatedAt: string; hasExcel?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [filtroGerente, setFiltroGerente] = useState("Todos");
  const [filtroEtapa, setFiltroEtapa] = useState("Todos");
  const [filtroEtapaReal, setFiltroEtapaReal] = useState("Todos");
  const [filtroMes, setFiltroMes] = useState("Todos");

  const [modalGerente, setModalGerente] = useState<string | null>(null);
  const [cadastroSelecionado, setCadastroSelecionado] = useState<Cadastro | null>(null);

  async function carregar(isAuto = false) {
    if (isAuto) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gerentes", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Erro ao carregar dados.");
        return;
      }
      const data = await res.json();
      setCadastros(data.cadastros);
      setGerentes(data.gerentes);
      setMeta(data.meta);
      setLastRefresh(new Date());
      setCountdown(REFRESH_INTERVAL_MS / 1000);
    } catch {
      setError("Não foi possível conectar à API.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregar();
    intervalRef.current = setInterval(() => carregar(true), REFRESH_INTERVAL_MS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL_MS / 1000 : prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Dados derivados ────────────────────────────────────────────────────────

  const gerentesUnicos    = ["Todos", ...Array.from(new Set(cadastros.map((c) => c.gerente).filter(Boolean))).sort()];
  const etapasUnicas      = ["Todos", ...Array.from(new Set(cadastros.map((c) => c.etapaFunil).filter(Boolean))).sort()];
  const etapasReaisUnicas = ["Todos", ...Array.from(new Set(cadastros.map((c) => c.etapaReal).filter((v): v is string => Boolean(v) && v !== "—"))).sort()];
  const mesesUnicos       = ["Todos", ...Array.from(new Set(cadastros.map((c) => getMes(c.dataEntrada)).filter(Boolean) as string[])).sort()];

  const filtrados = cadastros
    .filter((c) => {
      if (filtroGerente !== "Todos" && c.gerente !== filtroGerente) return false;
      if (filtroEtapa !== "Todos" && c.etapaFunil !== filtroEtapa) return false;
      if (filtroEtapaReal !== "Todos" && c.etapaReal !== filtroEtapaReal) return false;
      if (filtroMes !== "Todos" && getMes(c.dataEntrada) !== filtroMes) return false;
      return true;
    })
    .sort((a, b) => {
      if (!a.dataEntrada) return 1;
      if (!b.dataEntrada) return -1;
      return b.dataEntrada.localeCompare(a.dataEntrada);
    });

  const total     = filtrados.length;
  const ativados  = filtrados.filter((c) => ETAPAS_ATIVADO.has(c.etapaFunil)).length;
  const liberados = filtrados.filter((c) => ETAPAS_LIBERADO.has(c.etapaFunil)).length;
  const aprovados = filtrados.filter((c) => ETAPAS_APROVADO.has(c.etapaFunil)).length;
  const negados   = filtrados.filter((c) => ETAPAS_NEGATIVAS.has(c.etapaFunil)).length;
  const emAnalise = total - ativados - liberados - aprovados - negados;

  const statsPorGerente = cadastros.reduce((m, c) => {
    if (!c.gerente) return m;
    const cur = m.get(c.gerente) ?? { total: 0, ativados: 0, liberados: 0, aprovados: 0, negados: 0, emAnalise: 0 };
    cur.total++;
    if (ETAPAS_ATIVADO.has(c.etapaFunil))        cur.ativados++;
    else if (ETAPAS_LIBERADO.has(c.etapaFunil))  cur.liberados++;
    else if (ETAPAS_APROVADO.has(c.etapaFunil))  cur.aprovados++;
    else if (ETAPAS_NEGATIVAS.has(c.etapaFunil)) cur.negados++;
    else cur.emAnalise++;
    m.set(c.gerente, cur);
    return m;
  }, new Map<string, { total: number; ativados: number; liberados: number; aprovados: number; negados: number; emAnalise: number }>());

  const porGerente = Array.from(
    filtrados.reduce((m, c) => {
      if (!c.gerente) return m;
      const cur = m.get(c.gerente) ?? { gerente: c.gerente, total: 0, ativados: 0 };
      cur.total++;
      if (ETAPAS_POSITIVAS.has(c.etapaFunil)) cur.ativados++;
      m.set(c.gerente, cur);
      return m;
    }, new Map<string, { gerente: string; total: number; ativados: number }>())
  )
    .map(([, v]) => v)
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  const porMes = mesesUnicos
    .filter((m) => m !== "Todos")
    .map((mes) => {
      const list = cadastros.filter((c) => getMes(c.dataEntrada) === mes);
      return {
        mes: mesLabel(mes),
        total: list.length,
        ativados: list.filter((c) => ETAPAS_POSITIVAS.has(c.etapaFunil)).length,
        negados: list.filter((c) => ETAPAS_NEGATIVAS.has(c.etapaFunil)).length,
      };
    });

  const gerenteModalInfo = gerentes.find((g) => g.nome === modalGerente) ?? null;
  const cadastrosModal   = cadastros.filter((c) => c.gerente === modalGerente);
  const statsModal       = (() => {
    const s = statsPorGerente.get(modalGerente ?? "") ?? { total: 0, ativados: 0, liberados: 0, aprovados: 0, negados: 0, emAnalise: 0 };
    return { ...s, taxa: s.total > 0 ? Math.round(((s.ativados + s.liberados + s.aprovados) / s.total) * 100) : 0 };
  })();

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="cf-card p-8 flex flex-col items-center gap-3 text-center max-w-md mx-auto mt-12">
        <AlertCircle size={32} className="text-cf-danger" />
        <p className="text-sm font-semibold text-cf-text1">Erro ao carregar dados do Goalfy</p>
        <p className="text-xs text-cf-text3">{error}</p>
        <button onClick={() => carregar(false)} className="btn-primary text-xs mt-2">Tentar novamente</button>
      </div>
    );
  }

  return (
    <>
      {/* Modal de gerente */}
      {modalGerente && gerenteModalInfo && (
        <GerenteModal
          info={gerenteModalInfo}
          stats={statsModal}
          cadastros={cadastrosModal}
          onClose={() => setModalGerente(null)}
          onSelectCadastro={(c) => setCadastroSelecionado(c)}
        />
      )}

      {/* Modal de cadastro — z-60, aparece por cima */}
      {cadastroSelecionado && (
        <CadastroModal
          cadastro={cadastroSelecionado}
          onClose={() => setCadastroSelecionado(null)}
        />
      )}

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-cf-text1">Pipeline de Captação</h2>
              {refreshing && <RefreshCw size={12} className="animate-spin text-cf-navy opacity-50" />}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {lastRefresh && (
                <p className="text-xs text-cf-text3">
                  Atualizado às{" "}
                  <span className="text-cf-text2 font-medium">
                    {lastRefresh.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
              )}
              <span className="text-[10px] text-cf-text3 bg-cf-bg border border-cf-border rounded px-1.5 py-0.5">
                próxima em {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
              </span>
              {meta?.hasExcel && (
                <span className="text-[10px] text-cf-green bg-cf-green-pale border border-cf-green/20 rounded px-1.5 py-0.5">
                  + Excel
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => carregar(false)}
            className="flex items-center gap-2 text-xs font-medium text-cf-navy border border-cf-navy/30 px-3 py-2 rounded-lg hover:bg-cf-navy/5 transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Sincronizar agora
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: "Total Cadastros", value: total,     icon: FileSpreadsheet, color: "navy"    as const },
            { label: "Em Análise",      value: emAnalise, icon: Clock,           color: "warning" as const },
            { label: "Aprovados",       value: aprovados, icon: CheckCircle2,    color: "violet"  as const },
            { label: "Liberados",       value: liberados, icon: CheckCircle2,    color: "green"   as const },
            { label: "Ativados",        value: ativados,  icon: BadgeCheck,      color: "teal"    as const },
            { label: "Cancelados",      value: negados,   icon: XCircle,         color: "danger"  as const },
          ].map(({ label, value, icon: Icon, color }, idx) => {
            const colors = {
              navy:    { top: "border-t-cf-navy",     from: "from-cf-navy/[0.04]",  bg: "bg-cf-navy/10",     ic: "text-cf-navy"    },
              teal:    { top: "border-t-emerald-500", from: "from-emerald-50",      bg: "bg-emerald-100",    ic: "text-emerald-600"},
              green:   { top: "border-t-cf-green",    from: "from-cf-green-pale",   bg: "bg-cf-green-pale",  ic: "text-cf-green"   },
              violet:  { top: "border-t-violet-500",  from: "from-violet-50",       bg: "bg-violet-100",     ic: "text-violet-600" },
              warning: { top: "border-t-amber-400",   from: "from-amber-50",        bg: "bg-amber-50",       ic: "text-amber-600"  },
              danger:  { top: "border-t-red-400",     from: "from-red-50",          bg: "bg-red-50",         ic: "text-red-600"    },
            };
            const c = colors[color];
            return (
              <div
                key={label}
                className={cn(
                  "rounded-card border border-cf-surface shadow-cf-md border-t-4 bg-gradient-to-b to-white",
                  "p-4 flex items-start gap-3 animate-fade-in hover:shadow-cf-lg hover:-translate-y-0.5 transition-all duration-200",
                  c.top, c.from
                )}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className={cn("p-2.5 rounded-xl shadow-sm", c.bg)}>
                  <Icon size={18} className={c.ic} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-cf-text3 uppercase tracking-wide leading-tight">{label}</p>
                  <p className="cf-metric text-2xl text-cf-text1 mt-1">{value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards de gerentes */}
        {gerentes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
              <h3 className="text-sm font-semibold text-cf-text2">Equipe de Gerentes</h3>
              <span className="text-xs text-cf-text3">({gerentes.length})</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {gerentes.map((g, i) => {
                const s = statsPorGerente.get(g.nome) ?? { total: 0, ativados: 0, liberados: 0, aprovados: 0, negados: 0, emAnalise: 0 };
                const taxa = s.total > 0 ? Math.round(((s.ativados + s.liberados + s.aprovados) / s.total) * 100) : 0;
                return (
                  <CardGerente
                    key={g.nome}
                    info={g}
                    stats={{ ...s, taxa }}
                    idx={i}
                    onClick={() => setModalGerente(g.nome)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="cf-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
              <h3 className="text-sm font-semibold text-cf-text2">Cadastros por Gerente</h3>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(220, porGerente.length * 28)}>
              <BarChart data={porGerente} layout="vertical" barSize={14}>
                <defs>
                  <linearGradient id="gNavy" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#203b88" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1a4fa8" stopOpacity={0.75} />
                  </linearGradient>
                  <linearGradient id="gGreen" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#73b815" stopOpacity={1} />
                    <stop offset="100%" stopColor="#73b815" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="gerente" type="category" tick={{ fontSize: 11, fill: "#374151" }} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<BrandTooltip />} />
                <Bar dataKey="total"    fill="url(#gNavy)"  radius={[0, 4, 4, 0]} name="Total" />
                <Bar dataKey="ativados" fill="url(#gGreen)" radius={[0, 4, 4, 0]} name="Ativados" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="cf-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-cf-green shrink-0" />
              <h3 className="text-sm font-semibold text-cf-text2">Evolução Mensal</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porMes} barSize={24}>
                <defs>
                  <linearGradient id="gTotalMes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#203b88" stopOpacity={1} />
                    <stop offset="100%" stopColor="#203b88" stopOpacity={0.65} />
                  </linearGradient>
                  <linearGradient id="gAtivMes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#73b815" stopOpacity={1} />
                    <stop offset="100%" stopColor="#73b815" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip content={<BrandTooltip />} />
                <Bar dataKey="total"    fill="url(#gTotalMes)" radius={[5, 5, 0, 0]} name="Total" />
                <Bar dataKey="ativados" fill="url(#gAtivMes)"  radius={[5, 5, 0, 0]} name="Ativados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de cadastros — clicável */}
        <div className="cf-card">
          <div className="px-6 py-4 border-b border-cf-surface bg-cf-bg/40 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
              <h3 className="text-sm font-semibold text-cf-text2">
                Todos os Cadastros
                <span className="ml-2 text-xs font-normal text-cf-text3">({filtrados.length})</span>
              </h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={filtroGerente} onChange={(e) => setFiltroGerente(e.target.value)}
                className="text-xs border border-cf-surface rounded-lg px-3 py-1.5 bg-white text-cf-text2 focus:outline-none focus:border-cf-navy">
                {gerentesUnicos.map((g) => <option key={g} value={g}>{g === "Todos" ? "Gerentes" : g}</option>)}
              </select>
              <select value={filtroEtapaReal} onChange={(e) => setFiltroEtapaReal(e.target.value)}
                className="text-xs border border-cf-surface rounded-lg px-3 py-1.5 bg-white text-cf-text2 focus:outline-none focus:border-cf-navy max-w-[180px]">
                {etapasReaisUnicas.map((e) => <option key={e} value={e}>{e === "Todos" ? "Etapa real" : e}</option>)}
              </select>
              <select value={filtroEtapa} onChange={(e) => setFiltroEtapa(e.target.value)}
                className="text-xs border border-cf-surface rounded-lg px-3 py-1.5 bg-white text-cf-text2 focus:outline-none focus:border-cf-navy">
                {etapasUnicas.map((e) => <option key={e} value={e}>{e === "Todos" ? "Status" : e}</option>)}
              </select>
              <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}
                className="text-xs border border-cf-surface rounded-lg px-3 py-1.5 bg-white text-cf-text2 focus:outline-none focus:border-cf-navy">
                {mesesUnicos.map((m) => <option key={m} value={m}>{m === "Todos" ? "Todos os meses" : mesLabel(m)}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cf-surface">
                  <th className="px-6 py-3 text-left font-semibold text-cf-text3 uppercase tracking-wide">Empresa</th>
                  <th className="px-4 py-3 text-left font-semibold text-cf-text3 uppercase tracking-wide">Gerente</th>
                  <th className="px-4 py-3 text-left font-semibold text-cf-text3 uppercase tracking-wide">Entrada</th>
                  <th className="px-4 py-3 text-left font-semibold text-cf-text3 uppercase tracking-wide">Etapa Real</th>
                  <th className="px-4 py-3 text-left font-semibold text-cf-text3 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setCadastroSelecionado(c)}
                    className="border-b border-cf-surface/60 hover:bg-cf-bg/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium text-cf-text1 max-w-[280px] truncate">{c.nomeGrupo}</td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2 group"
                        onClick={(e) => { e.stopPropagation(); setModalGerente(c.gerente); }}
                      >
                        <AvatarGerente nome={c.gerente || "?"} size={26} />
                        <span className="text-cf-text2 group-hover:text-cf-navy group-hover:underline transition-colors">
                          {c.gerente}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-cf-text3">
                      {c.dataEntrada
                        ? new Date(c.dataEntrada + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-cf-text2 max-w-[200px]">
                      <span className="block truncate" title={c.etapaReal}>{c.etapaReal}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full font-medium text-[11px] border", etapaColor(c.etapaFunil))}>
                        {c.etapaFunil}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-cf-text3">
                      Nenhum cadastro encontrado com esses filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
