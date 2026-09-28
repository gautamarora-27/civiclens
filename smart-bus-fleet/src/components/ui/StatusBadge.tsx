import { cn } from "@/lib/utils";

type Tone = "healthy" | "weak" | "offline" | "online" | "warning" | "critical" | "neutral";

const toneStyles: Record<Tone, string> = {
  healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  online: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  weak: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  offline: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  critical: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
};

const dotStyles: Record<Tone, string> = {
  healthy: "bg-emerald-500",
  online: "bg-emerald-500",
  weak: "bg-amber-500",
  warning: "bg-amber-500",
  offline: "bg-red-500",
  critical: "bg-red-500",
  neutral: "bg-slate-400",
};

export function toneFromHealth(status: "healthy" | "weak" | "offline"): Tone {
  return status;
}

export function toneFromService(status: "Online" | "Offline" | "Warning"): Tone {
  if (status === "Online") return "online";
  if (status === "Warning") return "warning";
  return "offline";
}

export function StatusBadge({
  label,
  tone,
  pulse = false,
}: {
  label: string;
  tone: Tone;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        toneStyles[tone]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[tone], pulse && "animate-pulseDot")} />
      {label}
    </span>
  );
}
