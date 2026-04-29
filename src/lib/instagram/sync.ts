import { format, subDays } from "date-fns";
import {
  getAllMedia,
  getMediaInsights,
  getAccountInsights,
  getUserProfile,
} from "./api";
import { createServerClient } from "@/lib/supabase/server";

function mapMediaType(type: string): string {
  switch (type) {
    case "VIDEO":
      return "video";
    case "REEL":
      return "reel";
    case "CAROUSEL_ALBUM":
      return "carrossel";
    default:
      return "feed";
  }
}

export async function syncInstagramAccount(
  accountId: string,
  token: string
): Promise<{ success: boolean; posts: number; error?: string }> {
  const supabase = createServerClient();

  // 1. Atualizar perfil da conta
  const profile = await getUserProfile(token);
  await supabase
    .from("accounts")
    .update({
      username: profile.username,
      display_name: profile.name,
      avatar_url: profile.profile_picture_url ?? null,
      last_sync_at: new Date().toISOString(),
    })
    .eq("id", accountId);

  // 2. Buscar e salvar todos os posts
  const media = await getAllMedia(token);
  const followersCount = profile.followers_count ?? 1;

  for (const item of media) {
    // Upsert post
    const { data: post } = await supabase
      .from("posts")
      .upsert(
        {
          account_id: accountId,
          external_id: item.id,
          platform: "instagram",
          content_type: mapMediaType(item.media_type),
          caption: item.caption ?? null,
          url: item.permalink,
          thumbnail_url: item.thumbnail_url ?? item.media_url ?? null,
          published_at: item.timestamp,
        },
        { onConflict: "external_id" }
      )
      .select("id")
      .single();

    if (!post) continue;

    // Buscar e salvar métricas do post
    const insights = await getMediaInsights(token, item.id, item.media_type);
    if (Object.keys(insights).length > 0) {
      const totalEngagements =
        (insights.likes ?? 0) +
        (insights.comments ?? 0) +
        (insights.shares ?? 0) +
        (insights.saved ?? 0);
      const engagementRate =
        followersCount > 0 ? totalEngagements / followersCount : 0;

      await supabase.from("post_metrics").upsert(
        {
          post_id: post.id,
          date: format(new Date(item.timestamp), "yyyy-MM-dd"),
          reach: insights.reach ?? 0,
          impressions: insights.impressions ?? 0,
          likes: insights.likes ?? 0,
          comments: insights.comments ?? 0,
          shares: insights.shares ?? 0,
          saves: insights.saved ?? 0,
          video_views: insights.plays ?? 0,
          engagement_rate: engagementRate,
        },
        { onConflict: "post_id,date" }
      );
    }
  }

  // 3. Buscar insights da conta (últimos 30 dias)
  const until = format(new Date(), "yyyy-MM-dd");
  const since = format(subDays(new Date(), 30), "yyyy-MM-dd");

  try {
    const accountInsights = await getAccountInsights(token, since, until);
    const map: Record<string, number[]> = {};
    for (const item of accountInsights) {
      map[item.name] = item.values.map((v) => v.value);
    }

    // Salvar o valor mais recente de cada dia disponível
    const dates = accountInsights[0]?.values.map((v) => v.end_time) ?? [];
    for (let i = 0; i < dates.length; i++) {
      const date = format(new Date(dates[i]), "yyyy-MM-dd");
      const followers = map.follower_count?.[i] ?? 0;
      const prevFollowers = map.follower_count?.[i - 1] ?? followers;

      await supabase.from("account_metrics").upsert(
        {
          account_id: accountId,
          date,
          followers,
          follower_growth: followers - prevFollowers,
          reach: map.reach?.[i] ?? 0,
          impressions: map.impressions?.[i] ?? 0,
          profile_visits: map.profile_views?.[i] ?? 0,
        },
        { onConflict: "account_id,date" }
      );
    }
  } catch {
    // Insights da conta podem não estar disponíveis em contas sem permissão
  }

  return { success: true, posts: media.length };
}
