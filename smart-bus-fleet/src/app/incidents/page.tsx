"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IncidentTable } from "@/components/ui/IncidentTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { fetchIncidents } from "@/lib/api";
import { Incident, EventType, Severity } from "@/lib/types";
import { EVENT_TYPES } from "@/lib/mockData";
import { placeholderImage, formatDateTime, cn } from "@/lib/utils";
import { X } from "lucide-react";

const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "All">("All");
  const [eventType, setEventType] = useState<EventType | "All">("All");
  const [busFilter, setBusFilter] = useState("");

  useEffect(() => {
    fetchIncidents().then(setIncidents);
  }, []);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (severity !== "All" && i.severity !== severity) return false;
      if (eventType !== "All" && i.category !== eventType) return false;
      if (busFilter && !i.busNumber.toLowerCase().includes(busFilter.toLowerCase())) return false;
      if (query && !`${i.id} ${i.area} ${i.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [incidents, severity, eventType, busFilter, query]);

  return (
    <AppShell title="Incident Intelligence">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search incidents, area, category..." className="w-64" />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="All">All Severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType | "All")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="All">All Event Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          value={busFilter}
          onChange={(e) => setBusFilter(e.target.value)}
          placeholder="Filter by bus number"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />

        <span className="ml-auto text-xs text-slate-400">{filtered.length} incidents</span>
      </div>

      <IncidentTable incidents={filtered} onSelect={setSelected} />

      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={placeholderImage(selected.imageSeed, 480, 260)}
              alt={selected.category}
              className="mb-4 h-48 w-full rounded-xl2 object-cover"
            />

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">AI Summary</p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">{selected.aiSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category" value={selected.category} />
                <Field label="Severity" value={selected.severity} />
                <Field label="Bus" value={selected.busNumber} />
                <Field label="Area" value={selected.area} />
                <Field label="Confidence" value={`${selected.confidence}%`} />
                <Field label="Time" value={formatDateTime(selected.time)} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Exact Location</p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  {selected.position.lat.toFixed(5)}, {selected.position.lng.toFixed(5)} · {selected.area}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Nearby Buses</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selected.nearbyBuses.map((b) => (
                    <span key={b} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Resolution Notes</p>
                <p className={cn("mt-1", selected.resolutionNotes ? "text-slate-700 dark:text-slate-300" : "text-slate-400")}>
                  {selected.resolutionNotes ?? "No resolution notes yet — incident is still open."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-0.5 text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  );
}
