"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge, toneFromService } from "@/components/ui/StatusBadge";
import { fetchServiceHealth, fetchSystemMetrics } from "@/lib/api";
import { ServiceHealth, SystemMetric } from "@/lib/types";
import { Database, Radio, BrainCircuit, ScanFace, HardDrive, Cable } from "lucide-react";

const ICONS: Record<string, typeof Database> = {
  PostgreSQL: Database,
  "MQTT Broker": Radio,
  "AI Detector Service": BrainCircuit,
  "YOLO Model": ScanFace,
  "Object Storage": HardDrive,
  "WebSocket Gateway": Cable,
};

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);

  useEffect(() => {
    fetchServiceHealth().then(setServices);
    fetchSystemMetrics().then(setMetrics);
    const id = setInterval(() => fetchSystemMetrics().then(setMetrics), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <AppShell title="System Health">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const Icon = ICONS[s.name] ?? Database;
          return (
            <div key={s.name} className="rounded-xl2 border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Icon size={16} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                </div>
                <StatusBadge label={s.status} tone={toneFromService(s.status)} pulse={s.status === "Online"} />
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{s.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl2 border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Resource Utilization</h3>
        <div className="space-y-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{m.label}</span>
                <span>{m.percent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-2.5 rounded-full ${m.percent > 80 ? "bg-red-500" : m.percent > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${m.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
