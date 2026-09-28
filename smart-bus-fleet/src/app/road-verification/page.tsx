"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MapComponent } from "@/components/ui/MapComponent";
import { fetchDefectClusters } from "@/lib/api";
import { DefectCluster } from "@/lib/types";
import { placeholderImage, formatDateTime, cn } from "@/lib/utils";
import { CheckCircle2, Clock } from "lucide-react";

export default function RoadVerificationPage() {
  const [defects, setDefects] = useState<DefectCluster[]>([]);

  useEffect(() => {
    fetchDefectClusters().then(setDefects);
  }, []);

  const pins = defects.map((d) => ({
    id: d.id,
    position: d.position,
    kind: "defect" as const,
    label: d.eventType,
  }));

  return (
    <AppShell title="Road Defect Verification">
      <div className="mb-4">
        <MapComponent buses={[]} pins={pins} showRoutes={false} height={340} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {defects.map((d) => {
          const confirmed = d.reportingBuses >= 3;
          return (
            <div
              key={d.id}
              className="overflow-hidden rounded-xl2 border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={placeholderImage(d.imageSeed, 400, 200)} alt={d.eventType} className="h-36 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{d.eventType}</p>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      confirmed
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    )}
                  >
                    {confirmed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {confirmed ? "Confirmed" : "Awaiting Verification"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d.area}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Buses reporting: <b className="text-slate-700 dark:text-slate-200">{d.reportingBuses}</b></span>
                  <span>Confidence: <b className="text-slate-700 dark:text-slate-200">{d.confidence}%</b></span>
                  <span>First seen: {formatDateTime(d.firstSeen)}</span>
                  <span>Last seen: {formatDateTime(d.lastSeen)}</span>
                </div>

                {d.status === "Resolved" && d.beforeImageSeed && d.afterImageSeed && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium uppercase text-slate-400">Before / After Resolution</p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={placeholderImage(d.beforeImageSeed, 200, 120)} alt="Before" className="h-20 w-full rounded-lg object-cover" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={placeholderImage(d.afterImageSeed, 200, 120)} alt="After" className="h-20 w-full rounded-lg object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
