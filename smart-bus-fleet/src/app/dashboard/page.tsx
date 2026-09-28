"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { MapComponent } from "@/components/ui/MapComponent";
import { DetectionCard } from "@/components/ui/DetectionCard";
import { useRealtimeBuses } from "@/hooks/useRealtimeBuses";
import { useRealtimeDetections } from "@/hooks/useRealtimeDetections";
import { fetchDashboardKPIs, fetchDefectClusters } from "@/lib/api";
import { KPISnapshot, DefectCluster, Bus } from "@/lib/types";
import { useNotifications } from "@/context/NotificationContext";
import { Bus as BusIcon, Camera, ScanEye, Wrench, Timer } from "lucide-react";

export default function DashboardPage() {
  const { buses } = useRealtimeBuses();
  const { detections, latestId } = useRealtimeDetections(10);
  const [kpis, setKpis] = useState<KPISnapshot | null>(null);
  const [defects, setDefects] = useState<DefectCluster[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const { pushToast } = useNotifications();

  useEffect(() => {
    fetchDashboardKPIs().then(setKpis);
    fetchDefectClusters().then(setDefects);
  }, []);

  useEffect(() => {
    if (!latestId) return;
    const det = detections.find((d) => d.id === latestId);
    if (det && (det.eventType === "Accident" || det.eventType === "Waterlogging")) {
      pushToast({
        kind: det.eventType === "Accident" ? "critical" : "warning",
        title: `${det.eventType} detected`,
        message: `${det.busNumber} near ${det.location}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestId]);

  const mapPins = [
    ...defects.slice(0, 6).map((d) => ({
      id: d.id,
      position: d.position,
      kind: "defect" as const,
      label: d.eventType,
    })),
    ...buses
      .filter((b) => b.speedKmph < 5)
      .slice(0, 3)
      .map((b) => ({ id: `cong-${b.id}`, position: b.position, kind: "congestion" as const, label: "Congestion" })),
  ];

  return (
    <AppShell title="Live Operations Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard label="Active Buses" value={kpis?.activeBuses ?? "—"} icon={BusIcon} tone="brand" trend={{ direction: "up", value: "+2 vs yesterday" }} />
        <KPICard label="Live Cameras" value={kpis?.liveCameras ?? "—"} icon={Camera} tone="emerald" />
        <KPICard label="Events Detected Today" value={kpis?.eventsToday ?? "—"} icon={ScanEye} tone="amber" trend={{ direction: "up", value: "+18 in last hour" }} />
        <KPICard label="Confirmed Road Defects" value={kpis?.confirmedDefects ?? "—"} icon={Wrench} tone="red" />
        <KPICard label="Avg Response Time" value={kpis ? `${kpis.avgResponseMin} min` : "—"} icon={Timer} tone="slate" trend={{ direction: "down", value: "-4 min this week" }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Live City Map · {buses.length} buses tracked</h2>
            {selectedBus && (
              <button onClick={() => setSelectedBus(null)} className="text-xs text-brand-600 hover:underline">
                Clear selection
              </button>
            )}
          </div>
          <MapComponent buses={buses} pins={mapPins} onSelectBus={setSelectedBus} selectedBusId={selectedBus?.id ?? null} />
          {selectedBus && (
            <div className="mt-3 rounded-xl2 border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{selectedBus.number}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedBus.route} · Driver: {selectedBus.driver}</p>
                </div>
                <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <span>{selectedBus.speedKmph} km/h</span>
                  <span>GPS: {selectedBus.gpsStatus}</span>
                  <span>Camera: {selectedBus.cameraStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Live Detection Feed</h2>
          <div className="flex max-h-[560px] flex-col gap-2.5 overflow-y-auto pr-1">
            {detections.map((det) => (
              <DetectionCard key={det.id} detection={det} isNew={det.id === latestId} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
