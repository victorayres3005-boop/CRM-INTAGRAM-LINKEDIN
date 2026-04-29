import { PostsTable } from "@/components/dashboard/PostsTable";
import { getPostsWithMetrics } from "@/lib/supabase/queries";

export default async function PostsPage() {
  const posts = await getPostsWithMetrics();

  const rows = posts.map((p) => ({
    id: p.id,
    platform: p.platform,
    content_type: p.content_type,
    caption: p.caption,
    thumbnail_url: p.thumbnail_url ?? null,
    url: p.url ?? null,
    published_at: p.published_at,
    reach: p.reach,
    likes: p.likes,
    comments: p.comments,
    saves: p.saves,
    engagement_rate: p.engagement_rate,
    leads_count: p.leads_count,
    campaign_name: p.campaign_name,
  }));

  return <PostsTable posts={rows} />;
}
