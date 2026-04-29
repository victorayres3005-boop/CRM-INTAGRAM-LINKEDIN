"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  CheckCircle2, XCircle, Clock, AlertCircle,
  RefreshCw, RotateCcw, Users2, Search, X,
  Briefcase, Calendar, Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardReanalise } from "@/app/api/reanalise/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const FASES_CONCLUIDO    = new Set(["Concluído"]);
const FASES_CANCELADO    = new Set(["Cancelado"]);
const FASES_COMITE       = new Set(["Comitê", "Questionamentos"]);

const ORDEM_FASE: Record<string, number> = {
  "Entrada":        0,
  "Em Análise":     1,
  "Comitê":         2,
  "Questionamentos":3,
  "Concluído":      4,
  "Cancelado":      5,
};

function faseColor(fase: string): string {
  if (FASES_CONCLUIDO.has(fase)) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (FASES_CANCELADO.has(fase)) return "bg-red-50 text-red-600 border-red-200";
  if (FASES_COMITE.has(fase))    return "bg-violet-50 text-violet-700 border-violet-200";
  if (fase === "Em Análise")     return "bg-blue-50 text-blue-700 border-blue-100";
  return "bg-cf-navy/[0.06] text-cf-navy border-cf-navy/15";
}

function faseFill(fase: string): string {
  if (FASES_CONCLUIDO.has(fase)) return "#10b981";
  if (FASES_CANCELADO.has(fase)) return "#ef4444";
  if (FASES_COMITE.has(fase))    return "#7c3aed";
  if (fase === "Em Análise")     return "#3b82f6";
  return "#203b88";
}

function getMes(data: string | null) {
  return data ? data.slice(0, 7) : null;
}

function mesLabel(mes: string) {
  const m: Record<string, string> = {
    "2025-01": "Jan/25", "2025-02": "Fev/25", "2025-03": "Mar/25",
    "2025-04": "Abr/25", "2025-05": "Mai/25", "2025-06": "Jun/25",
    "2025-07": "Jul/25", "2025-08": "Ago/25", "2025-09": "Set/25",
    "2025-10": "Out/25", "2025-11": "Nov/25", "2025-12": "Dez/25",
    "2026-01": "Jan", "2026-02": "Fev", "2026-03": "Mar", "2026-04": "Abr",
    "2026-05": "Mai", "2026-06": "Jun", "2026-07": "Jul", "2026-08": "Ago",
    "2026-09": "Set", "2026-10": "Out", "2026-11": "Nov", "2026-12": "Dez",
  };
  return m[mes] ?? mes;
}

function diasColor(d: number) {
  if (d > 14) return "text-red-500";
  if (d > 7)  return "text-amber-600";
  return "text-cf-text2";
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function BrandTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cf-surface shadow-cf-lg rounded-xl px-3 py-2.5 min-w-[140px]">
      <p className="text-xs font-semibold text-cf-text2 mb-1.5 pb-1.5 border-b border-cf-surface truncate max-w-[200px]">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color ?? p.fill }} />
          <span className="text-xs font-semibold cf-metric text-cf-text1">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function CardModal({ card, onClose }: { card: CardReanalise; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-cf-navy/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden">
        <div className="bg-gradient-to-br from-cf-navy to-cf-navy/80 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/50 uppercase tracking-wider mb-1">Reanálise</p>
              <h2 className="text-base font-bold text-white leading-snug">{card.razaoSocial}</h2>
              <div className="mt-2.5">
                <span className={cn(
                  "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                  faseColor(card.fase)
                )}>
                  {card.fase}
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

        <div className="p-6 space-y-4">
          <div className={cn(
            "flex items-center gap-3 p-3.5 rounded-xl border",
            card.diasNaFase > 14 ? "bg-red-50 border-red-200"
            : card.diasNaFase > 7 ? "bg-amber-50 border-amber-200"
            : "bg-cf-bg border-cf-surface"
          )}>
            <Timer size={16} className={cn(
              card.diasNaFase > 14 ? "text-red-500" : card.diasNaFase > 7 ? "text-amber-600" : "text-cf-text3"
            )} />
            <div>
              <p className={cn("cf-metric text-xl font-bold", diasColor(card.diasNaFase))}>
                {card.diasNaFase} dias
              </p>
              <p className="text-[11px] text-cf-text3 mt-0.5">na fase atual</p>
            </div>
            {card.diasNaFase > 14 && (
              <span className="ml-auto text-[10px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                Atenção
              </span>
            )}
          </div>

          <div className="space-y-3">
            {[
              { icon: Briefcase, label: "Gerente",         value: card.gerente },
              { icon: Calendar,  label: "Data de entrada", value: card.dataEntrada
                  ? new Date(card.dataEntrada + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                  : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-cf-bg border border-cf-surface flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-cf-navy/60" />
                </div>
                <div>
                  <p className="text-[10px] text-cf-text3 uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-medium text-cf-text1 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function ReanalisePage() {
  const [cards, setCards] = useState<CardReanalise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [filtroFase, setFiltroFase] = useState("Todos");
  const [filtroGerente, setFiltroGerente] = useState("Todos");
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [cardSelecionado, setCardSelecionado] = useState<CardReanalise | null>(null);

  async function carregar(isAuto = false) {
    if (isAuto) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reanalise", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Erro ao carregar dados.");
        return;
      }
      const data = await res.json();
      setCards(data.reanalise);
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

  const fasesUnicas    = ["Todos", ...Array.from(new Set(cards.map((c) => c.fase).filter(Boolean))).sort(
    (a, b) => (ORDEM_FASE[a] ?? 99) - (ORDEM_FASE[b] ?? 99)
  )];
  const gerentesUnicos = ["Todos", ...Array.from(new Set(cards.map((c) => c.gerente).filter((g) => g !== "—"))).sort()];
  const mesesUnicos    = ["Todos", ...Array.from(new Set(cards.map((c) => getMes(c.dataEntrada)).filter(Boolean) as string[])).sort()];

  const filtrados = cards.filter((c) => {
    if (filtroFase    !== "Todos" && c.fase    !== filtroFase)    return false;
    if (filtroGerente !== "Todos" && c.gerente !== filtroGerente) return false;
    if (filtroMes     !== "Todos" && getMes(c.dataEntrada) !== filtroMes) return false;
    if (busca && !c.razaoSocial.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const total      = filtrados.length;
  const concluidos = filtrados.filter((c) => FASES_CONCLUIDO.has(c.fase)).length;
  const cancelados = filtrados.filter((c) => FASES_CANCELADO.has(c.fase)).length;
  const comite     = filtrados.filter((c) => FASES_COMITE.has(c.fase)).length;
  const emAnalise  = total - concluidos - cancelados - comite;

  const porFase = Array.from(
    cards.reduce((m, c) => {
      m.set(c.fase, (m.get(c.fase) ?? 0) + 1);
      return m;
    }, new Map<string, number>())
  )
    .map(([fase, count]) => ({ fase, count }))
    .sort((a, b) => (ORDEM_FASE[a.fase] ?? 99) - (ORDEM_FASE[b.fase] ?? 99));

  const porMes = mesesUnicos
    .filter((m) => m !== "Todos")
    .map((mes) => {
      const list = cards.filter((c) => getMes(c.dataEntrada) === mes);
      return {
        mes: mesLabel(mes),
        total: list.length,
        concluidos: list.filter((c) => FASES_CONCLUIDO.has(c.fase)).length,
        cancelados: list.filter((c) => FASES_CANCELADO.has(c.fase)).length,
      };
    });

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-cf-navy opacity-40" />
      </div>
    );
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
      {cardSelecionado && (
        <CardModal card={cardSelecionado} onClose={() => setCardSelecionado(null)} />
      )}

      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-cf-text1">Reanálise</h2>
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
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total em Reanálise", value: total,      icon: RotateCcw,    color: "navy"   as const },
            { label: "Concluídos",         value: concluidos, icon: CheckCircle2, color: "green"  as const },
            { label: "Em Comitê",          value: comite,     icon: Users2,       color: "violet" as const },
            { label: "Cancelados",         value: cancelados, icon: XCircle,      color: "danger" as const },
          ].map(({ label, value, icon: Icon, color }, idx) => {
            const colors = {
              navy:   { top: "border-t-cf-navy",    from: "from-cf-navy/[0.04]", bg: "bg-cf-navy/10",    ic: "text-cf-navy"    },
              green:  { top: "border-t-cf-green",   from: "from-cf-green-pale",  bg: "bg-cf-green-pale", ic: "text-cf-green"   },
              violet: { top: "border-t-violet-500", from: "from-violet-50",      bg: "bg-violet-100",    ic: "text-violet-600" },
              danger: { top: "border-t-red-400",    from: "from-red-50",         bg: "bg-red-50",        ic: "text-red-600"    },
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

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="cf-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
              <h3 className="text-sm font-semibold text-cf-text2">Cards por Fase</h3>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(180, porFase.length * 34)}>
              <BarChart data={porFase} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="fase" type="category" tick={{ fontSize: 10, fill: "#374151" }} width={120} axisLine={false} tickLine={false} />
                <Tooltip content={<BrandTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Cards">
                  {porFase.map((entry) => (
                    <Cell key={entry.fase} fill={faseFill(entry.fase)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="cf-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-cf-green shrink-0" />
              <h3 className="text-sm font-semibold text-cf-text2">Evolução Mensal</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porMes} barSize={20}>
                <defs>
                  <linearGradient id="gReanalTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#203b88" stopOpacity={1} />
                    <stop offset="100%" stopColor="#203b88" stopOpacity={0.65} />
                  </linearGradient>
                  <linearGradient id="gReanalConc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#73b815" stopOpacity={1} />
                    <stop offset="100%" stopColor="#73b815" stopOpacity={0.65} />
                  </linearGradient>
                  <linearGradient id="gReanalCanc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<BrandTooltip />} />
                <Bar dataKey="total"      fill="url(#gReanalTotal)" radius={[5, 5, 0, 0]} name="Total" />
                <Bar dataKey="concluidos" fill="url(#gReanalConc)"  radius={[5, 5, 0, 0]} name="Concluídos" />
                <Bar dataKey="cancelados" fill="url(#gReanalCanc)"  radius={[5, 5, 0, 0]} name="Cancelados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela */}
        <div className="cf-card">
          <div className="px-6 py-4 border-b border-cf-surface bg-cf-bg/40 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
              <h3 className="text-sm font-semibold text-cf-text2">
                Todos os Cards
                <span className="ml-2 text-xs font-normal text-cf-text3">({filtrados.length})</span>
              </h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cf-text3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar empresa..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="text-xs border border-cf-surface rounded-lg pl-7 pr-3 py-1.5 bg-white text-cf-text2 focus:outline-none focus:border-cf-navy w-44"
                />
                {busca && (
                  <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-cf-text3 hover:text-cf-text1">
                    <X size={11} />
                  </button>
                )}
              </div>
              <select value={filtroFase} onChange={(e) => setFiltroFase(e.target.value)}
                className="text-xs border border-cf-surface rounded-lg px-3 py-1.5 bg-white text-cf-text2 focus:outline-none focus:border-cf-navy">
                {fasesUnicas.map((f) => <option key={f} value={f}>{f === "Todos" ? "Status" : f}</option>)}
              </select>
              <select value={filtroGerente} onChange={(e) => setFiltroGerente(e.target.value)}
                className="text-xs border border-cf-surface rounded-lg px-3 py-1.5 bg-white text-cf-text2 focus:outline-none focus:border-cf-navy">
                {gerentesUnicos.map((g) => <option key={g} value={g}>{g === "Todos" ? "Gerentes" : g}</option>)}
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
                  <th className="px-4 py-3 text-left font-semibold text-cf-text3 uppercase tracking-wide">Fase</th>
                  <th className="px-4 py-3 text-left font-semibold text-cf-text3 uppercase tracking-wide">Entrada</th>
                  <th className="px-4 py-3 text-right font-semibold text-cf-text3 uppercase tracking-wide">Dias na Fase</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setCardSelecionado(c)}
                    className="border-b border-cf-surface/60 hover:bg-cf-bg/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium text-cf-text1 max-w-[280px] truncate">{c.razaoSocial}</td>
                    <td className="px-4 py-3 text-cf-text2">{c.gerente}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full font-medium text-[11px] border whitespace-nowrap", faseColor(c.fase))}>
                        {c.fase}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cf-text3">
                      {c.dataEntrada
                        ? new Date(c.dataEntrada + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("cf-metric font-semibold", diasColor(c.diasNaFase))}>{c.diasNaFase}d</span>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-cf-text3">
                      Nenhum card encontrado com esses filtros.
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
