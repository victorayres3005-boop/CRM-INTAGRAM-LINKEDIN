import { subWeeks, startOfWeek, format, eachWeekOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createServerClient } from "./server";
import type { Post, Campaign, ContentType, LeadStatus, Platform } from "@/lib/types/database";

// ─── Helpers ────────────────────────────────────────────────────────────────

function weekLabel(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "dd/MM", { locale: ptBR });
}

function last6WeekStarts(): Date[] {
  const now = new Date();
  return eachWeekOfInterval(
    { start: subWeeks(now, 5), end: now },
    { weekStartsOn: 1 }
  );
}

// ─── Dashboard Overview ──────────────────────────────────────────────────────

export async function getKpiMetrics() {
  const db = createServerClient();
  const sixWeeksAgo = subWeeks(new Date(), 6).toISOString().split("T")[0];
  const weekAgo = subWeeks(new Date(), 1).toISOString().split("T")[0];

  const [{ data: acctMetrics }, { data: leads }] = await Promise.all([
    db
      .from("account_metrics")
      .select("account_id, date, followers, reach, accounts(platform)")
      .gte("date", sixWeeksAgo)
      .order("date", { ascending: false }),
    db
      .from("leads")
      .select("id, captured_at")
      .gte("captured_at", weekAgo),
  ]);

  // Latest followers per account
  const latestByAccount = new Map<string, { followers: number; platform: string }>();
  for (const row of acctMetrics ?? []) {
    if (!latestByAccount.has(row.account_id)) {
      latestByAccount.set(row.account_id, {
        followers: row.followers,
        platform: (row.accounts as unknown as { platform: string })?.platform ?? "",
      });
    }
  }
  const totalFollowers = Array.from(latestByAccount.values()).reduce(
    (s, r) => s + r.followers,
    0
  );

  // Weekly reach (last 7 days)
  const weeklyReach = (acctMetrics ?? [])
    .filter((r) => r.date >= weekAgo)
    .reduce((s, r) => s + (r.reach ?? 0), 0);

  // Avg engagement from post_metrics last 7 days
  const { data: pmWeek } = await db
    .from("post_metrics")
    .select("engagement_rate")
    .gte("date", weekAgo);
  const avgEngagement =
    pmWeek && pmWeek.length > 0
      ? pmWeek.reduce((s, r) => s + (r.engagement_rate ?? 0), 0) / pmWeek.length
      : 0;

  return {
    totalFollowers,
    weeklyReach,
    avgEngagement,
    weeklyLeads: leads?.length ?? 0,
  };
}

export async function getFollowersOverTime() {
  const db = createServerClient();
  const weeks = last6WeekStarts();
  const from = weeks[0].toISOString().split("T")[0];

  const { data } = await db
    .from("account_metrics")
    .select("date, followers, accounts(platform)")
    .gte("date", from)
    .order("date", { ascending: true });

  return weeks.map((weekStart) => {
    const label = weekLabel(weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const inRange = (data ?? []).filter((r) => r.date >= weekStr && r.date <= weekEndStr);

    const igRows = inRange.filter(
      (r) => (r.accounts as unknown as { platform: string })?.platform === "instagram"
    );
    const liRows = inRange.filter(
      (r) => (r.accounts as unknown as { platform: string })?.platform === "linkedin"
    );

    const igFollowers = igRows.length ? Math.max(...igRows.map((r) => r.followers)) : 0;
    const liFollowers = liRows.length ? Math.max(...liRows.map((r) => r.followers)) : 0;

    return { semana: label, instagram: igFollowers, linkedin: liFollowers };
  });
}

export async function getEngagementOverTime() {
  const db = createServerClient();
  const weeks = last6WeekStarts();
  const from = weeks[0].toISOString().split("T")[0];

  const { data } = await db
    .from("post_metrics")
    .select("date, engagement_rate, posts(platform)")
    .gte("date", from)
    .order("date", { ascending: true });

  return weeks.map((weekStart) => {
    const label = weekLabel(weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const inRange = (data ?? []).filter((r) => r.date >= weekStr && r.date <= weekEndStr);
    const ig = inRange.filter((r) => (r.posts as unknown as { platform: string })?.platform === "instagram");
    const li = inRange.filter((r) => (r.posts as unknown as { platform: string })?.platform === "linkedin");

    const avg = (arr: typeof inRange) =>
      arr.length ? +(arr.reduce((s, r) => s + r.engagement_rate, 0) / arr.length).toFixed(2) : 0;

    return { semana: label, instagram: avg(ig), linkedin: avg(li) };
  });
}

export async function getLeadsOverTime() {
  const db = createServerClient();
  const weeks = last6WeekStarts();
  const from = weeks[0].toISOString();

  const { data } = await db
    .from("leads")
    .select("captured_at")
    .gte("captured_at", from)
    .order("captured_at", { ascending: true });

  return weeks.map((weekStart) => {
    const label = weekLabel(weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const count = (data ?? []).filter((r) => {
      const d = new Date(r.captured_at);
      return d >= weekStart && d <= weekEnd;
    }).length;

    return { semana: label, leads: count };
  });
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function getPostsWithMetrics(platform?: Platform): Promise<
  (Post & {
    reach: number;
    likes: number;
    comments: number;
    saves: number;
    video_views: number;
    engagement_rate: number;
    leads_count: number;
    campaign_name: string | null;
  })[]
> {
  const db = createServerClient();

  let query = db
    .from("posts")
    .select(
      `*, accounts(platform, display_name), campaigns(name),
       post_metrics(reach, likes, comments, saves, video_views, engagement_rate, date)`
    )
    .order("published_at", { ascending: false });

  if (platform) query = query.eq("platform", platform);

  const { data: posts } = await query;

  const { data: leads } = await db
    .from("leads")
    .select("post_id")
    .not("post_id", "is", null);

  const leadsCountByPost = new Map<string, number>();
  for (const l of leads ?? []) {
    leadsCountByPost.set(l.post_id!, (leadsCountByPost.get(l.post_id!) ?? 0) + 1);
  }

  return (posts ?? []).map((p) => {
    const metrics = (p.post_metrics as Array<{
      reach: number; likes: number; comments: number; saves: number;
      video_views: number; engagement_rate: number; date: string;
    }>);
    const latest = metrics?.sort((a, b) => b.date.localeCompare(a.date))[0];

    return {
      ...p,
      reach: latest?.reach ?? 0,
      likes: latest?.likes ?? 0,
      comments: latest?.comments ?? 0,
      saves: latest?.saves ?? 0,
      video_views: latest?.video_views ?? 0,
      engagement_rate: latest?.engagement_rate ?? 0,
      leads_count: leadsCountByPost.get(p.id) ?? 0,
      campaign_name: (p.campaigns as unknown as { name: string } | null)?.name ?? null,
    };
  });
}

// ─── Conteúdo ────────────────────────────────────────────────────────────────

export async function getContentTypePerformance() {
  const db = createServerClient();

  const [{ data: posts }, { data: metrics }, { data: leads }] = await Promise.all([
    db.from("posts").select("id, content_type"),
    db.from("post_metrics").select("post_id, reach, engagement_rate"),
    db.from("leads").select("post_id").not("post_id", "is", null),
  ]);

  const postMap = new Map<string, ContentType>();
  for (const p of posts ?? []) postMap.set(p.id, p.content_type as ContentType);

  const leadsCountByPost = new Map<string, number>();
  for (const l of leads ?? []) {
    leadsCountByPost.set(l.post_id!, (leadsCountByPost.get(l.post_id!) ?? 0) + 1);
  }

  const grouped = new Map<
    ContentType,
    { reaches: number[]; engagements: number[]; leads: number }
  >();

  for (const m of metrics ?? []) {
    const type = postMap.get(m.post_id);
    if (!type) continue;
    if (!grouped.has(type)) grouped.set(type, { reaches: [], engagements: [], leads: 0 });
    const g = grouped.get(type)!;
    g.reaches.push(m.reach ?? 0);
    g.engagements.push(m.engagement_rate ?? 0);
  }

  for (const [postId, count] of leadsCountByPost) {
    const type = postMap.get(postId);
    if (type && grouped.has(type)) grouped.get(type)!.leads += count;
  }

  const typeLabels: Record<ContentType, string> = {
    feed: "Feed",
    reel: "Reel",
    story: "Story",
    carrossel: "Carrossel",
    video: "Vídeo",
    artigo: "Artigo",
  };

  return Array.from(grouped.entries()).map(([type, g]) => ({
    tipo: typeLabels[type],
    alcance: g.reaches.length ? Math.round(g.reaches.reduce((a, b) => a + b) / g.reaches.length) : 0,
    engajamento: g.engagements.length
      ? +((g.engagements.reduce((a, b) => a + b) / g.engagements.length).toFixed(2))
      : 0,
    leads: g.leads,
  }));
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function getLeads(status?: LeadStatus) {
  const db = createServerClient();

  let query = db
    .from("leads")
    .select("*, posts(caption, platform), accounts(platform, display_name)")
    .order("captured_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data } = await query;
  return data ?? [];
}

export async function getLeadKpis() {
  const db = createServerClient();
  const { data } = await db.from("leads").select("status");
  const all = data ?? [];
  const total = all.length;
  const qualified = all.filter((l) => l.status === "qualificado").length;
  const clients = all.filter((l) => l.status === "cliente").length;
  return {
    total,
    qualified,
    clients,
    conversionRate: total > 0 ? +((clients / total) * 100).toFixed(0) : 0,
  };
}

// ─── Crescimento ─────────────────────────────────────────────────────────────

export async function getGrowthData() {
  const db = createServerClient();
  const weeks = last6WeekStarts();
  const from = weeks[0].toISOString().split("T")[0];

  const { data } = await db
    .from("account_metrics")
    .select("date, followers, follower_growth, reach, accounts(platform)")
    .gte("date", from)
    .order("date", { ascending: true });

  const weekSeries = weeks.map((weekStart) => {
    const label = weekLabel(weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const ws = weekStart.toISOString().split("T")[0];
    const we = weekEnd.toISOString().split("T")[0];

    const inRange = (data ?? []).filter((r) => r.date >= ws && r.date <= we);
    const ig = inRange.filter((r) => (r.accounts as unknown as { platform: string })?.platform === "instagram");
    const li = inRange.filter((r) => (r.accounts as unknown as { platform: string })?.platform === "linkedin");

    return {
      semana: label,
      instagram: ig.length ? Math.max(...ig.map((r) => r.followers)) : 0,
      linkedin: li.length ? Math.max(...li.map((r) => r.followers)) : 0,
      ig_ganhos: ig.reduce((s, r) => s + (r.follower_growth ?? 0), 0),
      li_ganhos: li.reduce((s, r) => s + (r.follower_growth ?? 0), 0),
    };
  });

  const reachSeries = weeks.map((weekStart) => {
    const label = weekLabel(weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const ws = weekStart.toISOString().split("T")[0];
    const we = weekEnd.toISOString().split("T")[0];

    const inRange = (data ?? []).filter((r) => r.date >= ws && r.date <= we);
    const igReach = inRange
      .filter((r) => (r.accounts as unknown as { platform: string })?.platform === "instagram")
      .reduce((s, r) => s + (r.reach ?? 0), 0);
    const liReach = inRange
      .filter((r) => (r.accounts as unknown as { platform: string })?.platform === "linkedin")
      .reduce((s, r) => s + (r.reach ?? 0), 0);

    return { semana: label, instagram: igReach, linkedin: liReach };
  });

  const latest = new Map<string, { followers: number; platform: string }>();
  for (const row of (data ?? []).slice().reverse()) {
    const platform = (row.accounts as unknown as { platform: string })?.platform;
    if (platform && !latest.has(platform)) {
      latest.set(platform, { followers: row.followers, platform });
    }
  }

  const igNow = latest.get("instagram")?.followers ?? 0;
  const liNow = latest.get("linkedin")?.followers ?? 0;
  const igStart = weekSeries[0]?.instagram ?? 0;
  const liStart = weekSeries[0]?.linkedin ?? 0;

  return {
    weekSeries,
    reachSeries,
    igNow,
    liNow,
    igGrowthTotal: igNow - igStart,
    liGrowthTotal: liNow - liStart,
    igGrowthPct: igStart > 0 ? (((igNow - igStart) / igStart) * 100).toFixed(1) : "0",
    liGrowthPct: liStart > 0 ? (((liNow - liStart) / liStart) * 100).toFixed(1) : "0",
    igAvgPerWeek: Math.round((igNow - igStart) / 6),
    liAvgPerWeek: Math.round((liNow - liStart) / 6),
  };
}

// ─── Campanhas ───────────────────────────────────────────────────────────────

export async function getCampaignsWithMetrics() {
  const db = createServerClient();

  const [{ data: campaigns }, { data: posts }, { data: metrics }, { data: leads }] =
    await Promise.all([
      db.from("campaigns").select("*").order("start_date", { ascending: false }),
      db.from("posts").select("id, campaign_id"),
      db.from("post_metrics").select("post_id, reach, engagement_rate"),
      db.from("leads").select("post_id").not("post_id", "is", null),
    ]);

  const postsByCampaign = new Map<string, string[]>();
  for (const p of posts ?? []) {
    if (!p.campaign_id) continue;
    const arr = postsByCampaign.get(p.campaign_id) ?? [];
    arr.push(p.id);
    postsByCampaign.set(p.campaign_id, arr);
  }

  const metricsByPost = new Map<string, { reach: number; engagement_rate: number }[]>();
  for (const m of metrics ?? []) {
    const arr = metricsByPost.get(m.post_id) ?? [];
    arr.push({ reach: m.reach ?? 0, engagement_rate: m.engagement_rate ?? 0 });
    metricsByPost.set(m.post_id, arr);
  }

  const leadsCountByPost = new Map<string, number>();
  for (const l of leads ?? []) {
    leadsCountByPost.set(l.post_id!, (leadsCountByPost.get(l.post_id!) ?? 0) + 1);
  }

  return (campaigns as Campaign[]).map((c) => {
    const postIds = postsByCampaign.get(c.id) ?? [];
    const allMetrics = postIds.flatMap((pid) => metricsByPost.get(pid) ?? []);
    const totalLeads = postIds.reduce((s, pid) => s + (leadsCountByPost.get(pid) ?? 0), 0);
    const totalReach = allMetrics.reduce((s, m) => s + m.reach, 0);
    const avgEngagement =
      allMetrics.length
        ? +(allMetrics.reduce((s, m) => s + m.engagement_rate, 0) / allMetrics.length).toFixed(1)
        : 0;

    return {
      ...c,
      posts: postIds.length,
      totalReach,
      totalLeads,
      avgEngagement,
    };
  });
}
