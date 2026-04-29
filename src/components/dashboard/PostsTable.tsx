"use client";

import { useState } from "react";
import { PlatformBadge } from "./PlatformBadge";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { formatNumber } from "@/lib/utils";
import type { Platform, ContentType } from "@/lib/types/database";

interface PostRow {
  id: string;
  platform: Platform;
  content_type: ContentType;
  caption: string | null;
  thumbnail_url: string | null;
  url: string | null;
  published_at: string;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  engagement_rate: number;
  leads_count: number;
  campaign_name: string | null;
}

const filters = [
  { key: "todos",     label: "Todos" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin",  label: "LinkedIn" },
] as const;

export function PostsTable({ posts }: { posts: PostRow[] }) {
  const [filter, setFilter] = useState<Platform | "todos">("todos");
  const filtered = filter === "todos" ? posts : posts.filter((p) => p.platform === filter);

  return (
    <div className="cf-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cf-border">
        <div className="flex gap-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "px-3 py-1 text-xs font-semibold bg-cf-navy text-white rounded-md"
                  : "px-3 py-1 text-xs font-medium text-cf-text3 hover:text-cf-text2 rounded-md hover:bg-cf-bg transition-colors"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-cf-text3">{filtered.length} posts</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-cf-text3">
          Nenhum post encontrado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cf-border bg-cf-bg">
                {["Publicação", "Tipo", "Alcance", "Engaj.", "Curtidas", "Coment.", "Salvos", "Leads", "Campanha"].map((h, i) => (
                  <th key={h} className={`px-4 py-2.5 cf-section-title ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cf-border/60">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-cf-bg/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.thumbnail_url ? (
                        <a href={post.url ?? "#"} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.thumbnail_url}
                            alt=""
                            className="w-9 h-9 rounded object-cover border border-cf-border flex-shrink-0"
                          />
                        </a>
                      ) : (
                        <div className="w-9 h-9 rounded bg-cf-surface flex items-center justify-center shrink-0">
                          <PlatformBadge platform={post.platform} />
                        </div>
                      )}
                      <div>
                        <p className="text-cf-text1 font-medium line-clamp-1 max-w-[260px]">
                          {post.caption ?? "—"}
                        </p>
                        <p className="text-cf-text3 mt-0.5">
                          {new Date(post.published_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><ContentTypeBadge type={post.content_type} /></td>
                  <td className="px-4 py-3 text-right cf-metric text-cf-text2">{formatNumber(post.reach)}</td>
                  <td className="px-4 py-3 text-right cf-metric text-cf-navy font-semibold">{post.engagement_rate.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right cf-metric text-cf-text2">{formatNumber(post.likes)}</td>
                  <td className="px-4 py-3 text-right cf-metric text-cf-text2">{post.comments}</td>
                  <td className="px-4 py-3 text-right cf-metric text-cf-text2">{post.saves || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="cf-metric font-semibold text-cf-green">{post.leads_count}</span>
                  </td>
                  <td className="px-4 py-3 text-cf-text3">{post.campaign_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
