"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

interface FollowersPoint { semana: string; instagram: number; linkedin: number }
interface EngagementPoint { semana: string; instagram: number; linkedin: number }
interface LeadsPoint { semana: string; leads: number }

interface Props {
  followers: FollowersPoint[];
  engagement: EngagementPoint[];
  leads: LeadsPoint[];
}

function ChartTooltip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cf-border shadow-cf-md rounded-lg px-3 py-2 min-w-[120px]">
      <p className="text-[10px] font-semibold text-cf-text3 uppercase tracking-wide mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-cf-text3">{p.name}</span>
          </div>
          <span className="text-xs font-semibold cf-metric text-cf-text1">
            {typeof p.value === "number" ? p.value.toLocaleString("pt-BR") : p.value}{unit}
          </span>
        </div>
      ))}
    </div>
  );
}

const axisStyle = { fontSize: 10, fill: "#94a3b8" };

function ChartCard({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`cf-card p-4 ${wide ? "xl:col-span-2" : ""}`}>
      <p className="cf-section-title mb-4">{title}</p>
      {children}
    </div>
  );
}

export function OverviewCharts({ followers, engagement, leads }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <ChartCard title="Crescimento de Seguidores">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={followers}>
            <CartesianGrid strokeDasharray="2 4" stroke="#e4e8f0" vertical={false} />
            <XAxis dataKey="semana" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="instagram" stroke="#db2777" strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} name="Instagram" />
            <Line type="monotone" dataKey="linkedin"  stroke="#203b88" strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} name="LinkedIn" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5"><span className="w-3 h-px bg-[#db2777] inline-block" /><span className="text-[10px] text-cf-text3">Instagram</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-px bg-cf-navy inline-block" /><span className="text-[10px] text-cf-text3">LinkedIn</span></div>
        </div>
      </ChartCard>

      <ChartCard title="Taxa de Engajamento (%)">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={engagement}>
            <CartesianGrid strokeDasharray="2 4" stroke="#e4e8f0" vertical={false} />
            <XAxis dataKey="semana" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} unit="%" width={36} />
            <Tooltip content={<ChartTooltip unit="%" />} />
            <Line type="monotone" dataKey="instagram" stroke="#db2777" strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} name="Instagram" />
            <Line type="monotone" dataKey="linkedin"  stroke="#203b88" strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} name="LinkedIn" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5"><span className="w-3 h-px bg-[#db2777] inline-block" /><span className="text-[10px] text-cf-text3">Instagram</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-px bg-cf-navy inline-block" /><span className="text-[10px] text-cf-text3">LinkedIn</span></div>
        </div>
      </ChartCard>

      <ChartCard title="Leads Captados por Semana" wide>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={leads} barSize={20}>
            <CartesianGrid strokeDasharray="2 4" stroke="#e4e8f0" vertical={false} />
            <XAxis dataKey="semana" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="leads" fill="#73b815" radius={[3, 3, 0, 0]} name="Leads" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
