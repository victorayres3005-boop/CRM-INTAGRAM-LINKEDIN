import { OverviewCharts } from "@/components/dashboard/charts/OverviewCharts";
import { Users, Eye, Heart, UserPlus, Instagram, Linkedin, TrendingUp } from "lucide-react";
import {
  getKpiMetrics,
  getFollowersOverTime,
  getEngagementOverTime,
  getLeadsOverTime,
  getGrowthData,
  getLeadKpis,
  getPostsWithMetrics,
} from "@/lib/supabase/queries";
import { formatNumber, formatPercent } from "@/lib/utils";
import { ContentTypeBadge } from "@/components/dashboard/ContentTypeBadge";

export default async function DashboardPage() {
  const [kpis, followers, engagement, leads, growth, leadKpis, posts] =
    await Promise.all([
      getKpiMetrics(),
      getFollowersOverTime(),
      getEngagementOverTime(),
      getLeadsOverTime(),
      getGrowthData(),
      getLeadKpis(),
      getPostsWithMetrics(),
    ]);

  const topPosts = posts
    .filter((p) => p.platform === "instagram")
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 5);

  const igGrowthNum = Number(growth.igGrowthTotal);
  const liGrowthNum = Number(growth.liGrowthTotal);

  return (
    <div className="space-y-4">

      {/* ── Plataformas ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Instagram */}
        <div className="cf-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram size={14} className="text-pink-500" />
              <span className="text-[11px] font-semibold text-cf-text3 uppercase tracking-widest">Instagram</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
              igGrowthNum >= 0
                ? "text-cf-green bg-cf-green-pale border-cf-green/20"
                : "text-red-500 bg-red-50 border-red-100"
            }`}>
              {igGrowthNum >= 0 ? "+" : ""}{formatNumber(igGrowthNum)} em 6 sem.
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="cf-metric text-4xl text-cf-text1 leading-none">{formatNumber(growth.igNow)}</p>
              <p className="text-xs text-cf-text3 mt-1.5">seguidores</p>
            </div>
            <div className="text-right space-y-1.5">
              <div>
                <p className="cf-metric text-lg text-cf-navy leading-none">{formatPercent(kpis.avgEngagement)}</p>
                <p className="text-[10px] text-cf-text3">engajamento</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-cf-border">
            {[
              { label: "Alcance semanal", value: formatNumber(kpis.weeklyReach) },
              { label: "Leads (7 dias)",  value: String(kpis.weeklyLeads) },
              { label: "Média/semana",    value: `+${growth.igAvgPerWeek}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="cf-metric text-sm text-cf-text1">{value}</p>
                <p className="text-[10px] text-cf-text3 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* LinkedIn */}
        <div className="cf-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Linkedin size={14} className="text-cf-navy" />
              <span className="text-[11px] font-semibold text-cf-text3 uppercase tracking-widest">LinkedIn</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
              liGrowthNum >= 0
                ? "text-cf-green bg-cf-green-pale border-cf-green/20"
                : "text-red-500 bg-red-50 border-red-100"
            }`}>
              {liGrowthNum >= 0 ? "+" : ""}{formatNumber(liGrowthNum)} em 6 sem.
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="cf-metric text-4xl text-cf-text1 leading-none">{formatNumber(growth.liNow)}</p>
              <p className="text-xs text-cf-text3 mt-1.5">seguidores</p>
            </div>
            <div className="text-right">
              <p className="cf-metric text-lg text-cf-navy leading-none">{growth.liGrowthPct}%</p>
              <p className="text-[10px] text-cf-text3">crescimento</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-cf-border">
            {[
              { label: "Total leads",     value: String(leadKpis.total) },
              { label: "Clientes",        value: String(leadKpis.clients) },
              { label: "Conversão",       value: `${leadKpis.conversionRate}%` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="cf-metric text-sm text-cf-text1">{value}</p>
                <p className="text-[10px] text-cf-text3 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPIs compactos ───────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Seguidores totais",  value: formatNumber(kpis.totalFollowers), icon: Users,     color: "text-cf-navy"  },
          { label: "Alcance semanal",    value: formatNumber(kpis.weeklyReach),    icon: Eye,       color: "text-cf-green" },
          { label: "Engajamento médio",  value: formatPercent(kpis.avgEngagement), icon: Heart,     color: "text-amber-500"},
          { label: "Leads (7 dias)",     value: String(kpis.weeklyLeads),          icon: UserPlus,  color: "text-cf-green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="cf-card px-4 py-3 flex items-center gap-3">
            <Icon size={14} className={`${color} opacity-60 shrink-0`} />
            <div>
              <p className="text-[10px] text-cf-text3 uppercase tracking-widest font-semibold">{label}</p>
              <p className={`cf-metric text-xl leading-tight mt-0.5 ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráficos + Top Posts ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

        {/* Gráficos — ocupa 2 colunas */}
        <div className="xl:col-span-2">
          <OverviewCharts followers={followers} engagement={engagement} leads={leads} />
        </div>

        {/* Top Posts Instagram */}
        <div className="cf-card overflow-hidden">
          <div className="px-4 py-3 border-b border-cf-border flex items-center justify-between">
            <p className="cf-section-title">Top Posts · Instagram</p>
            <TrendingUp size={12} className="text-cf-text3" />
          </div>
          {topPosts.length === 0 ? (
            <p className="px-4 py-8 text-xs text-cf-text3 text-center">
              Nenhum post ainda. Sincronize sua conta.
            </p>
          ) : (
            <div className="divide-y divide-cf-border/60">
              {topPosts.map((post, i) => (
                <div key={post.id} className="px-4 py-3 flex items-start gap-3 hover:bg-cf-bg transition-colors">
                  <span className="cf-metric text-[11px] text-cf-text3 w-4 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cf-text1 line-clamp-2 leading-relaxed">
                      {post.caption ?? "—"}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <ContentTypeBadge type={post.content_type} />
                      <span className="text-[10px] text-cf-text3">
                        {formatNumber(post.reach)} alcance
                      </span>
                      {post.engagement_rate > 0 && (
                        <span className="text-[10px] font-semibold text-cf-navy">
                          {post.engagement_rate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
