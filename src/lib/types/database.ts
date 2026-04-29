export type Platform = "instagram" | "linkedin";

export type ContentType =
  | "feed"
  | "reel"
  | "story"
  | "carrossel"
  | "video"
  | "artigo";

export type LeadStatus = "novo" | "qualificado" | "cliente" | "perdido";

export interface Account {
  id: string;
  platform: Platform;
  username: string;
  display_name: string;
  profile_url: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  account_id: string;
  external_id: string | null;
  platform: Platform;
  content_type: ContentType;
  caption: string | null;
  url: string | null;
  thumbnail_url: string | null;
  published_at: string;
  campaign_id: string | null;
  created_at: string;
  accounts?: Account;
  campaigns?: Campaign;
}

export interface PostMetrics {
  id: string;
  post_id: string;
  date: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  video_views: number;
  engagement_rate: number;
  created_at: string;
}

export interface AccountMetrics {
  id: string;
  account_id: string;
  date: string;
  followers: number;
  follower_growth: number;
  reach: number;
  impressions: number;
  profile_visits: number;
  created_at: string;
  accounts?: Account;
}

export interface Lead {
  id: string;
  post_id: string | null;
  account_id: string | null;
  platform: Platform | null;
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  notes: string | null;
  captured_at: string;
  created_at: string;
  posts?: Post;
  accounts?: Account;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  goal: string | null;
  created_at: string;
}

export interface PostWithMetrics extends Post {
  post_metrics: PostMetrics[];
}
