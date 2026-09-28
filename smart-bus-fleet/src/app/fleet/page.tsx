"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BusCard } from "@/components/ui/BusCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { useRealtimeBuses } from "@/hooks/useRealtimeBuses";

export default function FleetPage() {
  const { buses, loading } = useRealtimeBuses();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "weak" | "offline">("all");

  const filtered = useMemo(() => {
    return buses.filter((b) => {
      if (statusFilter !== "all" && b.gpsStatus !== statusFilter && b.cameraStatus !== statusFilter && b.aiStatus !== statusFilter) {
        return false;
      }
      if (query && !`${b.number} ${b.driver} ${b.route}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [buses, query, statusFilter]);

  return (
    <AppShell title="Bus Fleet Monitoring">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar value={query} onChange={setQuery} placeholder="Search bus number, driver, route..." className="w-72" />
        <div className="flex gap-2">
          {(["all", "healthy", "weak", "offline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ring-1 ring-inset ${
                statusFilter === s
                  ? "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/30"
                  : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} of {buses.length} buses</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading fleet...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
