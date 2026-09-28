import { Detection } from "@/lib/types";
import { placeholderImage, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const eventToneMap: Record<Detection["eventType"], string> = {
  Pothole: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Road Crack": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Garbage: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Waterlogging: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "Traffic Congestion": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Accident: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  "Illegal Parking": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Encroachment: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
};

export function DetectionCard({ detection, isNew = false }: { detection: Detection; isNew?: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl2 border border-slate-200 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900",
        isNew && "animate-slideIn"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={placeholderImage(detection.thumbnailSeed, 96, 72)}
        alt={detection.eventType}
        className="h-16 w-20 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", eventToneMap[detection.eventType])}>
            {detection.eventType}
          </span>
          <span className="text-[11px] text-slate-400">{timeAgo(detection.timestamp)}</span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
          {detection.busNumber} · {detection.route}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{detection.location}</p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-1.5 rounded-full bg-brand-600"
            style={{ width: `${detection.confidence}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{detection.confidence}% confidence</p>
      </div>
    </div>
  );
}
