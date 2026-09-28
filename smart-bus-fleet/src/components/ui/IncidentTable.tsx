import { Incident } from "@/lib/types";
import { formatDateTime, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const severityStyles: Record<Incident["severity"], string> = {
  Low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  High: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  Critical: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const statusStyles: Record<Incident["status"], string> = {
  Pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "Under Review": "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Confirmed: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export function IncidentTable({
  incidents,
  onSelect,
}: {
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl2 border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
              <th className="px-4 py-3 font-medium">Incident ID</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Bus</th>
              <th className="px-4 py-3 font-medium">Area</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => onSelect(incident)}
                className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{incident.id}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{incident.category}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", severityStyles[incident.severity])}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{incident.busNumber}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{incident.area}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(incident.time)}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusStyles[incident.status])}>
                    {incident.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  No incidents match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
