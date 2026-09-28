import Link from "next/link";
import { Bus } from "@/lib/types";
import { StatusBadge, toneFromHealth } from "./StatusBadge";
import { timeAgo, cn } from "@/lib/utils";
import { Gauge, Radio, Camera, Cpu } from "lucide-react";

const overallToneRank = { healthy: 0, weak: 1, offline: 2 };

export function BusCard({ bus }: { bus: Bus }) {
  const worst = [bus.gpsStatus, bus.cameraStatus, bus.aiStatus].sort(
    (a, b) => overallToneRank[b] - overallToneRank[a]
  )[0];
  const ringColor =
    worst === "healthy" ? "ring-emerald-200" : worst === "weak" ? "ring-amber-200" : "ring-red-200";
  const dotColor = worst === "healthy" ? "bg-emerald-500" : worst === "weak" ? "bg-amber-500" : "bg-red-500";

  return (
    <Link
      href={`/fleet/${bus.id}`}
      className={cn(
        "block rounded-xl2 border border-slate-200 bg-white p-4 shadow-card ring-1 ring-inset transition hover:shadow-panel dark:border-slate-800 dark:bg-slate-900",
        ringColor
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", dotColor)} />
          <p className="font-semibold text-slate-900 dark:text-slate-50">{bus.number}</p>
        </div>
        <span className="text-xs text-slate-400">{timeAgo(bus.lastUpdated)}</span>
      </div>
      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{bus.route}</p>
      <p className="text-xs text-slate-400">Driver: {bus.driver}</p>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <Gauge size={14} className="text-slate-400" />
        {bus.speedKmph} km/h
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStatus icon={Radio} label="GPS" status={bus.gpsStatus} />
        <MiniStatus icon={Camera} label="Camera" status={bus.cameraStatus} />
        <MiniStatus icon={Cpu} label="AI" status={bus.aiStatus} />
      </div>
    </Link>
  );
}

function MiniStatus({
  icon: Icon,
  label,
  status,
}: {
  icon: typeof Radio;
  label: string;
  status: "healthy" | "weak" | "offline";
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 py-1.5 dark:bg-slate-800/60">
      <Icon size={13} className="text-slate-400" />
      <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
      <StatusBadge label={status} tone={toneFromHealth(status)} />
    </div>
  );
}
