const IG_API = "https://graph.instagram.com/v21.0";
const IG_OAUTH_URL = "https://www.instagram.com/oauth/authorize";
const IG_TOKEN_URL = "https://api.instagram.com/oauth/access_token";

export interface IGMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "REEL" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export interface IGProfile {
  id: string;
  username: string;
  name: string;
  profile_picture_url?: string;
  followers_count?: number;
}

export function getOAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    scope: "instagram_business_basic,instagram_business_manage_insights",
    response_type: "code",
  });
  return `${IG_OAUTH_URL}?${params}`;
}

export async function exchangeCodeForToken(
  code: string
): Promise<{ access_token: string; user_id: string }> {
  const res = await fetch(IG_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID!,
      client_secret: process.env.INSTAGRAM_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      code,
    }),
  });
  if (!res.ok) throw new Error(`Troca de código falhou: ${await res.text()}`);
  return res.json();
}

export async function getLongLivedToken(shortToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    access_token: shortToken,
  });
  const res = await fetch(`${IG_API}/access_token?${params}`);
  if (!res.ok)
    throw new Error(`Troca para token longo falhou: ${await res.text()}`);
  return res.json();
}

export async function refreshLongLivedToken(
  token: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: token,
  });
  const res = await fetch(`${IG_API}/refresh_access_token?${params}`);
  if (!res.ok)
    throw new Error(`Renovação de token falhou: ${await res.text()}`);
  return res.json();
}

export async function getUserProfile(token: string): Promise<IGProfile> {
  const params = new URLSearchParams({
    fields: "id,username,name,profile_picture_url,followers_count",
    access_token: token,
  });
  const res = await fetch(`${IG_API}/me?${params}`);
  if (!res.ok) throw new Error(`Busca de perfil falhou: ${await res.text()}`);
  return res.json();
}

async function getMediaPage(
  token: string,
  after?: string
): Promise<{
  data: IGMedia[];
  paging?: { cursors: { after: string }; next?: string };
}> {
  const params = new URLSearchParams({
    fields:
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    limit: "50",
    access_token: token,
  });
  if (after) params.set("after", after);
  const res = await fetch(`${IG_API}/me/media?${params}`);
  if (!res.ok) throw new Error(`Busca de mídia falhou: ${await res.text()}`);
  return res.json();
}

export async function getAllMedia(token: string): Promise<IGMedia[]> {
  const all: IGMedia[] = [];
  let after: string | undefined;

  do {
    const page = await getMediaPage(token, after);
    all.push(...page.data);
    after = page.paging?.next ? page.paging.cursors.after : undefined;
  } while (after);

  return all;
}

export async function getMediaInsights(
  token: string,
  mediaId: string,
  mediaType: string
): Promise<Record<string, number>> {
  const isVideo = mediaType === "VIDEO" || mediaType === "REEL";
  const metric = isVideo
    ? "impressions,reach,likes,comments,shares,saved,plays"
    : "impressions,reach,likes,comments,shares,saved";

  const params = new URLSearchParams({ metric, access_token: token });
  const res = await fetch(`${IG_API}/${mediaId}/insights?${params}`);
  if (!res.ok) return {};

  const json = await res.json();
  const result: Record<string, number> = {};
  for (const item of json.data ?? []) {
    result[item.name] = item.values?.[0]?.value ?? item.value ?? 0;
  }
  return result;
}

export async function getAccountInsights(
  token: string,
  since: string,
  until: string
): Promise<{ name: string; values: { value: number; end_time: string }[] }[]> {
  const params = new URLSearchParams({
    metric: "impressions,reach,profile_views,follower_count",
    period: "day",
    since,
    until,
    access_token: token,
  });
  const res = await fetch(`${IG_API}/me/insights?${params}`);
  if (!res.ok)
    throw new Error(`Insights da conta falhou: ${await res.text()}`);
  const json = await res.json();
  return json.data ?? [];
}
