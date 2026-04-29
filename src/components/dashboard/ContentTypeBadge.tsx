import { cn } from "@/lib/utils";
import type { ContentType } from "@/lib/types/database";

const styles: Record<ContentType, string> = {
  feed:      "bg-slate-100 text-slate-600 border-slate-200",
  reel:      "bg-purple-50 text-purple-600 border-purple-100",
  story:     "bg-amber-50 text-amber-600 border-amber-100",
  carrossel: "bg-indigo-50 text-indigo-600 border-indigo-100",
  video:     "bg-red-50 text-red-600 border-red-100",
  artigo:    "bg-teal-50 text-teal-600 border-teal-100",
};

const labels: Record<ContentType, string> = {
  feed:      "Feed",
  reel:      "Reel",
  story:     "Story",
  carrossel: "Carrossel",
  video:     "Vídeo",
  artigo:    "Artigo",
};

export function ContentTypeBadge({ type }: { type: ContentType }) {
  return (
    <span className={cn(
      "inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border tracking-wide uppercase",
      styles[type]
    )}>
      {labels[type]}
    </span>
  );
}
