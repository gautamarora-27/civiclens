import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "emerald" | "amber" | "red" | "slate";
  trend?: { direction: "up" | "down"; value: string };
}

const toneMap = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export function KPICard({ label, value, icon: Icon, tone = "brand", trend }: KPICardProps) {
  return (
    <div className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneMap[tone])}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      {trend && (
        <p
          className={cn(
            "mt-3 text-xs font-medium",
            trend.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}
        >
          {trend.direction === "up" ? "▲" : "▼"} {trend.value}
        </p>
      )}
    </div>
  );
}
