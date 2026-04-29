"use client";

import { useState } from "react";
import { PlatformBadge } from "./PlatformBadge";
import type { LeadStatus, Platform } from "@/lib/types/database";

interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  platform: Platform | null;
  status: LeadStatus;
  post_caption: string | null;
  captured_at: string;
}

const statusLabels: Record<LeadStatus, string> = {
  novo: "Novo", qualificado: "Qualificado", cliente: "Cliente", perdido: "Perdido",
};

const statusColors: Record<LeadStatus, string> = {
  novo:        "bg-slate-100 text-slate-500 border-slate-200",
  qualificado: "bg-cf-navy/8 text-cf-navy border-cf-navy/15",
  cliente:     "bg-cf-green-pale text-cf-green-dark border-cf-green/20",
  perdido:     "bg-red-50 text-red-500 border-red-100",
};

const filters = ["todos", "novo", "qualificado", "cliente", "perdido"] as const;

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "todos">("todos");
  const filtered = statusFilter === "todos" ? leads : leads.filter((l) => l.status === statusFilter);

  return (
    <div className="cf-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cf-border">
        <div className="flex gap-1">
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                statusFilter === s
                  ? "px-3 py-1 text-xs font-semibold bg-cf-navy text-white rounded-md"
                  : "px-3 py-1 text-xs font-medium text-cf-text3 hover:text-cf-text2 rounded-md hover:bg-cf-bg transition-colors"
              }
            >
              {s === "todos" ? "Todos" : statusLabels[s]}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-cf-text3">{filtered.length} leads</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-cf-text3">Nenhum lead encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cf-border bg-cf-bg">
                {["Lead", "Contato", "Origem", "Post", "Status", "Data"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left cf-section-title">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cf-border/60">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-cf-bg/70 transition-colors">
                  <td className="px-4 py-3 font-medium text-cf-text1">{lead.name}</td>
                  <td className="px-4 py-3 text-cf-text3">
                    <p>{lead.email ?? "—"}</p>
                    {lead.phone && <p className="mt-0.5 text-cf-text3/70">{lead.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {lead.platform ? <PlatformBadge platform={lead.platform} /> : <span className="text-cf-text3">—</span>}
                  </td>
                  <td className="px-4 py-3 text-cf-text3 max-w-[220px]">
                    <p className="line-clamp-1">{lead.post_caption ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cf-text3">
                    {new Date(lead.captured_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
