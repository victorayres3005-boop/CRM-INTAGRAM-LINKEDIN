"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from "recharts";

interface ContentRow { tipo: string; alcance: number; engajamento: number; leads: number }

function BrandTooltip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cf-surface shadow-cf-lg rounded-xl px-3 py-2.5 min-w-[130px]">
      <p className="text-xs font-semibold text-cf-text2 mb-1.5 pb-1.5 border-b border-cf-surface">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-xs text-cf-text3">{p.name}:</span>
          <span className="text-xs font-semibold cf-metric text-cf-text1 ml-auto pl-2">
            {typeof p.value === "number" ? p.value.toLocaleString("pt-BR") : p.value}{unit}
          </span>
        </div>
      ))}
    </div>
  );
}

const axis = { fontSize: 11, fill: "#6b7280" };
const colors = ["#203b88", "#73b815", "#e1306c", "#d97706", "#7c3aed", "#0891b2"];

export function ContentCharts({ data }: { data: ContentRow[] }) {
  const maxReach = Math.max(...data.map((d) => d.alcance), 1);
  const maxEng   = Math.max(...data.map((d) => d.engajamento), 1);
  const maxLeads = Math.max(...data.map((d) => d.leads), 1);

  const radarData = [
    { metric: "Alcance",     ...Object.fromEntries(data.map((r) => [r.tipo, Math.round((r.alcance / maxReach) * 100)])) },
    { metric: "Engajamento", ...Object.fromEntries(data.map((r) => [r.tipo, Math.round((r.engajamento / maxEng) * 100)])) },
    { metric: "Leads",       ...Object.fromEntries(data.map((r) => [r.tipo, Math.round((r.leads / maxLeads) * 100)])) },
  ];

  return (
    <div className="space-y-5">
      <div className="cf-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
          <h3 className="text-sm font-semibold text-cf-text2">Alcance médio por tipo de conteúdo</h3>
        </div>
        <p className="text-xs text-cf-text3 mb-4 pl-3">Qual formato chega em mais pessoas</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" barSize={22}>
            <defs>
              <linearGradient id="alcanceGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#203b88" stopOpacity={1} />
                <stop offset="100%" stopColor="#1a4fa8" stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" horizontal={false} />
            <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
            <YAxis dataKey="tipo" type="category" tick={axis} width={70} axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip />} />
            <Bar dataKey="alcance" fill="url(#alcanceGrad)" radius={[0, 5, 5, 0]} name="Alcance" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="cf-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full bg-cf-green shrink-0" />
            <h3 className="text-sm font-semibold text-cf-text2">Leads por tipo de conteúdo</h3>
          </div>
          <p className="text-xs text-cf-text3 mb-4 pl-3">O que converte mais</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barSize={28}>
              <defs>
                <linearGradient id="leadsConteudoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#73b815" stopOpacity={1} />
                  <stop offset="100%" stopColor="#73b815" stopOpacity={0.65} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
              <XAxis dataKey="tipo" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip />} />
              <Bar dataKey="leads" fill="url(#leadsConteudoGrad)" radius={[6, 6, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cf-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
            <h3 className="text-sm font-semibold text-cf-text2">Performance comparativa</h3>
          </div>
          <p className="text-xs text-cf-text3 mb-4 pl-3">Pontuação relativa (0–100)</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#edf2fb" />
              <PolarAngleAxis dataKey="metric" tick={axis} />
              {data.slice(0, 4).map((r, i) => (
                <Radar key={r.tipo} name={r.tipo} dataKey={r.tipo} stroke={colors[i]} fill={colors[i]} fillOpacity={0.14} strokeWidth={1.5} />
              ))}
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip content={<BrandTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
