"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AnalyticsChartCard } from "@/components/ui/AnalyticsChartCard";
import {
  eventsByCategory,
  hourlyDetectionTrend,
  defectsByZone,
  topBusyRoutes,
  congestionByTime,
  aiAccuracyTrend,
} from "@/lib/mockData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#2563EB", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#f97316"];

type Range = "today" | "week" | "month";

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("week");

  const categoryData = useMemo(() => eventsByCategory(), [range]);
  const hourlyData = useMemo(() => hourlyDetectionTrend(), [range]);
  const zoneData = useMemo(() => defectsByZone(), [range]);
  const routeData = useMemo(() => topBusyRoutes().slice(0, 10), [range]);
  const congestionData = useMemo(() => congestionByTime(), [range]);
  const accuracyData = useMemo(() => aiAccuracyTrend(), [range]);

  return (
    <AppShell title="Urban Analytics">
      <div className="mb-4 flex justify-end gap-2">
        {(["today", "week", "month"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ring-1 ring-inset ${
              range === r
                ? "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/30"
                : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChartCard title="Events by Category" subtitle="AI-detected events, all routes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Hourly Detection Trend" subtitle="Detections per hour, 24h window">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="detections" stroke="#2563EB" fill="url(#hourGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Road Defects by Zone" subtitle="Share of confirmed defects">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={zoneData} dataKey="value" nameKey="area" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {zoneData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Top 10 Busy Routes" subtitle="Trips completed in range">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="route" tick={{ fontSize: 10 }} width={70} />
              <Tooltip />
              <Bar dataKey="trips" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Congestion by Time" subtitle="Congestion index (0–100)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={congestionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="congestionIndex" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="AI Detection Accuracy" subtitle="Model accuracy, last 7 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChartCard>
      </div>
    </AppShell>
  );
}
