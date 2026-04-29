import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { getLeads, getLeadKpis } from "@/lib/supabase/queries";

export default async function LeadsPage() {
  const [rawLeads, kpis] = await Promise.all([getLeads(), getLeadKpis()]);

  const leads = rawLeads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    platform: l.platform,
    status: l.status,
    post_caption: (l.posts as { caption: string } | null)?.caption ?? null,
    captured_at: l.captured_at,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total de Leads" value={String(kpis.total)} icon={Users} color="navy" />
        <KpiCard title="Qualificados" value={String(kpis.qualified)} icon={TrendingUp} color="warning" />
        <KpiCard title="Convertidos em Cliente" value={String(kpis.clients)} icon={UserCheck} color="green" />
        <KpiCard title="Taxa de Conversão" value={`${kpis.conversionRate}%`} icon={UserX} color="navy" />
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
