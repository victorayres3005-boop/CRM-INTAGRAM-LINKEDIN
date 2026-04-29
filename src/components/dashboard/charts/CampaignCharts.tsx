"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface CampaignRow { name: string; totalReach: number; totalLeads: number; avgEngagement: number }

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

export function CampaignCharts({ data }: { data: CampaignRow[] }) {
  const chartData = data.map((c) => ({
    nome: c.name.length > 16 ? c.name.slice(0, 16) + "…" : c.name,
    alcance: c.totalReach,
    leads: c.totalLeads,
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div className="cf-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
          <h3 className="text-sm font-semibold text-cf-text2">Alcance por campanha</h3>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} barSize={28}>
            <defs>
              <linearGradient id="alcanceCampGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#203b88" stopOpacity={1} />
                <stop offset="100%" stopColor="#203b88" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
            <XAxis dataKey="nome" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip />} />
            <Bar dataKey="alcance" fill="url(#alcanceCampGrad)" radius={[6, 6, 0, 0]} name="Alcance" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="cf-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-cf-green shrink-0" />
          <h3 className="text-sm font-semibold text-cf-text2">Leads por campanha</h3>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} barSize={28}>
            <defs>
              <linearGradient id="leadsCampGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#73b815" stopOpacity={1} />
                <stop offset="100%" stopColor="#73b815" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
            <XAxis dataKey="nome" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip />} />
            <Bar dataKey="leads" fill="url(#leadsCampGrad)" radius={[6, 6, 0, 0]} name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
