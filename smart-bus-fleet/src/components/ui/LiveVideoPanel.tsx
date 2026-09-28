"use client";

import { useEffect, useState } from "react";

interface BoundingBox {
  id: string;
  x: number; // percent
  y: number; // percent
  w: number; // percent
  h: number; // percent
  label: string;
  confidence: number;
}

interface LiveVideoPanelProps {
  isLive: boolean;
  seed: string;
  boxes: BoundingBox[];
}

export function LiveVideoPanel({ isLive, seed, boxes }: LiveVideoPanelProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setFrame((f) => f + 1), 1200);
    return () => clearInterval(id);
  }, [isLive]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl2 border border-slate-200 bg-slate-900 shadow-card dark:border-slate-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="http://127.0.0.1:8001/video"
        alt="Live CivicLens camera feed"
        className="h-full w-full object-cover"
      />

      {isLive && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          <span className="h-2 w-2 animate-pulseDot rounded-full bg-red-500" />
          LIVE
        </div>
      )}

      <div className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-white">
        FRAME #{1000 + frame}
      </div>

      {!isLive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p className="text-sm font-medium text-white">Stream paused</p>
        </div>
      )}
    </div>
  );
}
