"use client";

import { useMemo, useState } from "react";
import { Bus, GeoPoint } from "@/lib/types";
import { CITY_CENTER, ROUTES } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface MapPin {
  id: string;
  position: GeoPoint;
  kind: "defect" | "accident" | "congestion";
  label: string;
}

interface MapComponentProps {
  buses: Bus[];
  pins?: MapPin[];
  onSelectBus?: (bus: Bus) => void;
  selectedBusId?: string | null;
  height?: number;
  showRoutes?: boolean;
}

const BOUNDS = 0.07; // degrees from center shown on map

function project(point: GeoPoint, width: number, height: number) {
  const x = ((point.lng - (CITY_CENTER.lng - BOUNDS)) / (BOUNDS * 2)) * width;
  const y = height - ((point.lat - (CITY_CENTER.lat - BOUNDS)) / (BOUNDS * 2)) * height;
  return { x, y };
}

const pinColor: Record<MapPin["kind"], string> = {
  defect: "#f59e0b",
  accident: "#ef4444",
  congestion: "#f97316",
};

export function MapComponent({
  buses,
  pins = [],
  onSelectBus,
  selectedBusId,
  height = 420,
  showRoutes = true,
}: MapComponentProps) {
  const width = 720;
  const [hovered, setHovered] = useState<string | null>(null);

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 1; i < 8; i++) {
      lines.push({ x1: (width / 8) * i, y1: 0, x2: (width / 8) * i, y2: height });
    }
    for (let i = 1; i < 6; i++) {
      lines.push({ x1: 0, y1: (height / 6) * i, x2: width, y2: (height / 6) * i });
    }
    return lines;
  }, [height]);

  return (
    <div className="relative overflow-hidden rounded-xl2 border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" style={{ height }}>
        <rect width={width} height={height} className="fill-slate-100 dark:fill-slate-950" />
        {gridLines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={1}
          />
        ))}

        {showRoutes &&
          ROUTES.map((route) => {
            const pts = route.points.map((p) => project(p, width, height));
            const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
            return (
              <path
                key={route.id}
                d={d}
                fill="none"
                className="stroke-brand-200 dark:stroke-brand-900"
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}

        {pins.map((pin) => {
          const p = project(pin.position, width, height);
          const isCongestion = pin.kind === "congestion";
          return (
            <g key={pin.id} transform={`translate(${p.x}, ${p.y})`}>
              {isCongestion ? (
                <circle r={16} fill={pinColor[pin.kind]} opacity={0.18} />
              ) : (
                <circle r={9} fill={pinColor[pin.kind]} opacity={0.15} />
              )}
              <circle r={5} fill={pinColor[pin.kind]} stroke="white" strokeWidth={1.5} />
            </g>
          );
        })}

        {buses.map((bus) => {
          const p = project(bus.position, width, height);
          const isSelected = bus.id === selectedBusId;
          const isHovered = bus.id === hovered;
          const color =
            bus.gpsStatus === "offline" ? "#ef4444" : bus.gpsStatus === "weak" ? "#f59e0b" : "#2563EB";
          return (
            <g
              key={bus.id}
              transform={`translate(${p.x}, ${p.y}) rotate(${bus.heading})`}
              className="cursor-pointer"
              onClick={() => onSelectBus?.(bus)}
              onMouseEnter={() => setHovered(bus.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ transition: "transform 1.2s linear" }}
            >
              {(isSelected || isHovered) && <circle r={13} fill={color} opacity={0.18} />}
              <path d="M0,-7 L6,6 L0,3 L-6,6 Z" fill={color} stroke="white" strokeWidth={1} />
            </g>
          );
        })}
      </svg>

      {hovered &&
        (() => {
          const bus = buses.find((b) => b.id === hovered);
          if (!bus) return null;
          const p = project(bus.position, width, height);
          return (
            <div
              className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-panel dark:border-slate-700 dark:bg-slate-900"
              style={{ left: `${(p.x / width) * 100}%`, top: `${(p.y / height) * 100}%`, transform: "translate(-50%, -130%)" }}
            >
              <p className="font-semibold text-slate-800 dark:text-slate-100">{bus.number}</p>
              <p className="text-slate-500 dark:text-slate-400">{bus.speedKmph} km/h · {bus.route}</p>
            </div>
          );
        })()}

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] text-slate-600 shadow-card backdrop-blur dark:bg-slate-900/90 dark:text-slate-300">
        <LegendDot color="#2563EB" label="Bus (healthy)" />
        <LegendDot color="#f59e0b" label="Weak signal / defect" />
        <LegendDot color="#ef4444" label="Offline / accident" />
        <LegendDot color="#f97316" label="Congestion" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
