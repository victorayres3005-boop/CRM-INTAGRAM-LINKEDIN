"use client";

import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface WeekPoint { semana: string; instagram: number; linkedin: number; ig_ganhos?: number; li_ganhos?: number }

interface Props {
  weekSeries: WeekPoint[];
  reachSeries: { semana: string; instagram: number; linkedin: number }[];
}

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

export function GrowthCharts({ weekSeries, reachSeries }: Props) {
  return (
    <div className="space-y-5">
      <div className="cf-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
          <h3 className="text-sm font-semibold text-cf-text2">Seguidores acumulados</h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={weekSeries}>
            <defs>
              <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#e1306c" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#e1306c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="liGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#203b88" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#203b88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
            <XAxis dataKey="semana" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip content={<BrandTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="instagram" stroke="#e1306c" fill="url(#igGrad)" strokeWidth={2.5} activeDot={{ r: 5, strokeWidth: 0 }} name="Instagram" />
            <Area type="monotone" dataKey="linkedin"  stroke="#203b88" fill="url(#liGrad)" strokeWidth={2.5} activeDot={{ r: 5, strokeWidth: 0 }} name="LinkedIn" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="cf-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
            <h3 className="text-sm font-semibold text-cf-text2">Novos seguidores por semana</h3>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={weekSeries} barSize={22}>
              <defs>
                <linearGradient id="igBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e1306c" stopOpacity={1} />
                  <stop offset="100%" stopColor="#e1306c" stopOpacity={0.65} />
                </linearGradient>
                <linearGradient id="liBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#203b88" stopOpacity={1} />
                  <stop offset="100%" stopColor="#203b88" stopOpacity={0.65} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
              <XAxis dataKey="semana" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="ig_ganhos" fill="url(#igBarGrad)" radius={[5, 5, 0, 0]} name="Instagram" />
              <Bar dataKey="li_ganhos" fill="url(#liBarGrad)" radius={[5, 5, 0, 0]} name="LinkedIn" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cf-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-cf-navy shrink-0" />
            <h3 className="text-sm font-semibold text-cf-text2">Alcance semanal</h3>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={reachSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2fb" vertical={false} />
              <XAxis dataKey="semana" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip content={<BrandTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="instagram" stroke="#e1306c" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Instagram" />
              <Line type="monotone" dataKey="linkedin"  stroke="#203b88" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="LinkedIn" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
