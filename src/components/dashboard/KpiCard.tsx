import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  color?: "navy" | "green" | "warning" | "danger";
}

const accent: Record<string, string> = {
  navy:    "text-cf-navy",
  green:   "text-cf-green",
  warning: "text-amber-500",
  danger:  "text-red-500",
};

export function KpiCard({ title, value, change, changePositive, icon: Icon, color = "navy" }: KpiCardProps) {
  return (
    <div className="cf-card p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="cf-section-title">{title}</p>
        <Icon size={14} className={cn("opacity-40", accent[color])} />
      </div>
      <p className={cn("cf-metric text-3xl leading-none", accent[color])}>{value}</p>
      {change && (
        <p className={cn(
          "text-xs flex items-center gap-1",
          changePositive ? "text-cf-green" : "text-red-500"
        )}>
          <span>{changePositive ? "↑" : "↓"}</span>
          <span>{change} vs semana anterior</span>
        </p>
      )}
    </div>
  );
}
