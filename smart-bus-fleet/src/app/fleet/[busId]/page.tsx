"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MapComponent } from "@/components/ui/MapComponent";
import { DetectionCard } from "@/components/ui/DetectionCard";
import { StatusBadge, toneFromHealth } from "@/components/ui/StatusBadge";
import { useRealtimeBuses } from "@/hooks/useRealtimeBuses";
import { generateDetections } from "@/lib/mockData";
import { placeholderImage } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowLeft } from "lucide-react";

export default function BusDetailPage() {
  const params = useParams<{ busId: string }>();
  const router = useRouter();
  const { buses } = useRealtimeBuses();
  const bus = buses.find((b) => b.id === params.busId);

  const [speedHistory, setSpeedHistory] = useState<{ t: string; speed: number }[]>([]);

  useEffect(() => {
    if (!bus) return;
    setSpeedHistory((prev) => {
      const next = [...prev, { t: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), speed: bus.speedKmph }];
      return next.slice(-20);
    });
  }, [bus?.speedKmph]); // eslint-disable-line react-hooks/exhaustive-deps

  const detections = useMemo(() => (bus ? generateDetections([bus], 20) : []), [bus?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!bus) {
    return (
      <AppShell title="Bus Details">
        <p className="text-sm text-slate-400">Loading bus details, or this bus ID does not exist...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Bus ${bus.number}`}>
      <button
        onClick={() => router.push("/fleet")}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft size={15} /> Back to Fleet
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{bus.number}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{bus.route} · Driver: {bus.driver} · {bus.depot}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge label={`GPS: ${bus.gpsStatus}`} tone={toneFromHealth(bus.gpsStatus)} pulse />
          <StatusBadge label={`Camera: ${bus.cameraStatus}`} tone={toneFromHealth(bus.cameraStatus)} />
          <StatusBadge label={`AI: ${bus.aiStatus}`} tone={toneFromHealth(bus.aiStatus)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Route Map</h3>
            <MapComponent buses={[bus]} selectedBusId={bus.id} height={340} />
          </div>

          <div className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Speed (last 20 readings)</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} unit=" km/h" width={55} />
                  <Tooltip />
                  <Line type="monotone" dataKey="speed" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Camera Preview</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={placeholderImage(`${bus.id}-preview`, 640, 360)}
              alt="Camera preview"
              className="aspect-video w-full rounded-xl2 border border-slate-200 object-cover dark:border-slate-800"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Last 20 Detections</h3>
          <div className="flex max-h-[720px] flex-col gap-2 overflow-y-auto pr-1">
            {detections.map((d) => (
              <DetectionCard key={d.id} detection={d} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
