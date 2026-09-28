"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { fetchPlaybackClips } from "@/lib/api";
import { PlaybackClip } from "@/lib/types";
import { placeholderImage, formatDateTime, cn } from "@/lib/utils";
import { Play, X, StepBack, StepForward, Layers } from "lucide-react";

export default function PlaybackPage() {
  const [clips, setClips] = useState<PlaybackClip[]>([]);
  const [active, setActive] = useState<PlaybackClip | null>(null);
  const [overlayOn, setOverlayOn] = useState(true);

  useEffect(() => {
    fetchPlaybackClips().then(setClips);
  }, []);

  return (
    <AppShell title="Event Playback">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clips.map((clip) => (
          <button
            key={clip.id}
            onClick={() => setActive(clip)}
            className="group overflow-hidden rounded-xl2 border border-slate-200 bg-white text-left shadow-card transition hover:shadow-panel dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={placeholderImage(clip.thumbnailSeed, 320, 180)} alt={clip.eventType} className="h-36 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                <Play size={28} className="text-white opacity-0 transition group-hover:opacity-100" />
              </div>
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {clip.durationSec}s
              </span>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{clip.eventType}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{clip.route}</p>
              <p className="text-xs text-slate-400">{clip.busNumber} · {formatDateTime(clip.date)}</p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-xl2 bg-white p-4 shadow-panel dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{active.eventType} · {active.busNumber}</p>
                <p className="text-xs text-slate-400">{active.route} · {formatDateTime(active.date)}</p>
              </div>
              <button onClick={() => setActive(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={placeholderImage(active.id, 960, 540)} alt={active.eventType} className="h-full w-full object-cover" />
              {overlayOn && (
                <div className="absolute left-1/3 top-1/4 h-1/3 w-1/3 rounded-sm border-2 border-emerald-400">
                  <span className="absolute -top-5 left-0 rounded bg-emerald-400 px-1.5 py-0.5 text-[10px] font-semibold text-slate-900">
                    {active.eventType} · 92%
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700">
                  <StepBack size={14} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Play size={14} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700">
                  <StepForward size={14} />
                </button>
              </div>
              <button
                onClick={() => setOverlayOn((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-inset",
                  overlayOn
                    ? "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/30"
                    : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
                )}
              >
                <Layers size={13} /> AI Overlay
              </button>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 w-2/3 rounded-full bg-brand-600" />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
