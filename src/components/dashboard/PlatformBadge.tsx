import { cn } from "@/lib/utils";
import type { Platform } from "@/lib/types/database";

const styles: Record<Platform, string> = {
  instagram: "text-pink-600 bg-pink-50 border-pink-100",
  linkedin:  "text-cf-navy bg-cf-navy/5 border-cf-navy/10",
};

const labels: Record<Platform, string> = {
  instagram: "IG",
  linkedin:  "LI",
};

export function PlatformBadge({ platform, full }: { platform: Platform; full?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border tracking-wider uppercase",
      styles[platform]
    )}>
      {full ? (platform === "instagram" ? "Instagram" : "LinkedIn") : labels[platform]}
    </span>
  );
}
