"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Pause } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LiveVideoPanel } from "@/components/ui/LiveVideoPanel";
import { useRealtimeBuses } from "@/hooks/useRealtimeBuses";
import { API_BASE } from "@/lib/api";
import { EventType } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

interface LiveDetectionEvent {
  id: string;
  eventType: EventType;
  confidence: number;
  frameId: number;
  gps: string;
  speed: number;
  timestamp: string;
}

interface BackendDetection {
  id: number;
  vehicle_id: number;
  issue_type: string;
  confidence: number;
  severity: number;
  latitude: number;
  longitude: number;
  image_url: string | null;
  detected_at: string;
}

const FILTER_GROUPS: { label: string; types: EventType[] }[] = [
  {
    label: "Defect",
    types: ["Pothole", "Road Crack"],
  },
  {
    label: "Environment",
    types: ["Garbage", "Waterlogging", "Encroachment"],
  },
];

const TYPE_MAP: Record<string, EventType> = {
  pothole: "Pothole",
  road_damage: "Road Crack",
  road_crack: "Road Crack",
  garbage: "Garbage",
  waterlogging: "Waterlogging",
  encroachment: "Encroachment",
};

export default function LiveDetectionPage() {
  const { buses } = useRealtimeBuses();

  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedCamera, setSelectedCamera] = useState(
    "Front-Facing (CAM-01)"
  );
  const [isLive, setIsLive] = useState(true);

  const [activeFilters, setActiveFilters] = useState<string[]>(
    FILTER_GROUPS.map((group) => group.label)
  );

  const [events, setEvents] = useState<LiveDetectionEvent[]>([]);

  useEffect(() => {
    if (buses.length > 0 && !selectedBusId) {
      setSelectedBusId(buses[0].id);
    }
  }, [buses, selectedBusId]);

  useEffect(() => {
    if (!isLive) return;

    const loadDetections = async () => {
      try {
        const response = await fetch(`${API_BASE}/detections`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: BackendDetection[] = await response.json();

        const mapped = data
          .filter((detection) => {
            if (!selectedBusId) return true;

            return (
              String(detection.vehicle_id) === selectedBusId
            );
          })
          .map<LiveDetectionEvent>((detection) => ({
            id: String(detection.id),

            eventType:
              TYPE_MAP[detection.issue_type.toLowerCase()] ??
              "Pothole",

            confidence: Math.round(
              detection.confidence * 100
            ),

            frameId: detection.id,

            gps: `${Number(
              detection.latitude
            ).toFixed(6)}, ${Number(
              detection.longitude
            ).toFixed(6)}`,

            speed: 0,

            timestamp: detection.detected_at,
          }));

        setEvents(mapped);
      } catch (error) {
        console.error(
          "Live detection fetch error:",
          error
        );
      }
    };

    loadDetections();

    const interval = setInterval(
      loadDetections,
      2000
    );

    return () => clearInterval(interval);
  }, [isLive, selectedBusId]);

  const filteredEvents = useMemo(() => {
    const allowedTypes = FILTER_GROUPS
      .filter((group) =>
        activeFilters.includes(group.label)
      )
      .flatMap((group) => group.types);

    return events.filter((event) =>
      allowedTypes.includes(event.eventType)
    );
  }, [events, activeFilters]);

  const boxes = useMemo(
    () =>
      filteredEvents
        .slice(0, 3)
        .map((event, index) => ({
          id: event.id,
          x: 10 + index * 25,
          y: 20 + index * 15,
          w: 18,
          h: 18,
          label: event.eventType,
          confidence: event.confidence,
        })),
    [filteredEvents]
  );

  function toggleFilter(label: string) {
    setActiveFilters((previous) =>
      previous.includes(label)
        ? previous.filter(
            (item) => item !== label
          )
        : [...previous, label]
    );
  }

  const selectedBus = buses.find(
    (bus) => bus.id === selectedBusId
  );

  return (
    <AppShell title="Live AI Detection">
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl2 border border-slate-200 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <select
          value={selectedBusId}
          onChange={(event) =>
            setSelectedBusId(event.target.value)
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          {buses.map((bus) => (
            <option
              key={bus.id}
              value={bus.id}
            >
              {bus.number} · {bus.route}
            </option>
          ))}
        </select>

        <select
          value={selectedCamera}
          onChange={(event) =>
            setSelectedCamera(event.target.value)
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option>
            Front-Facing (CAM-01)
          </option>
          <option>
            Road-Facing (CAM-02)
          </option>
          <option>
            Rear (CAM-03)
          </option>
        </select>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setIsLive(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
              isLive
                ? "bg-brand-600 text-white"
                : "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            )}
          >
            <Play size={14} />
            Start Stream
          </button>

          <button
            onClick={() => setIsLive(false)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
              !isLive
                ? "bg-slate-800 text-white"
                : "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            )}
          >
            <Pause size={14} />
            Pause
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <LiveVideoPanel
            isLive={isLive}
            seed={`${selectedBusId}-${selectedCamera}`}
            boxes={boxes}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {FILTER_GROUPS.map((group) => (
              <button
                key={group.label}
                onClick={() =>
                  toggleFilter(group.label)
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset",
                  activeFilters.includes(
                    group.label
                  )
                    ? "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/30"
                    : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
                )}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl2 border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Detection Timeline
            </p>

            <div className="relative h-10 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {filteredEvents
                .slice(0, 25)
                .map((event, index) => (
                  <span
                    key={event.id}
                    title={`${event.eventType} · ${event.confidence}%`}
                    className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded-full bg-brand-600"
                    style={{
                      left: `${
                        (index / 25) * 100
                      }%`,
                    }}
                  />
                ))}

              <div className="absolute inset-y-0 right-0 w-px bg-red-500" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Real-Time Detections
            {selectedBus &&
              ` · ${selectedBus.number}`}
          </h2>

          <div className="flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="animate-slideIn rounded-xl2 border border-slate-200 bg-white p-3 text-sm shadow-card dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {event.eventType}
                  </span>

                  <span className="text-xs text-slate-400">
                    {timeAgo(
                      event.timestamp
                    )}
                  </span>
                </div>

                <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Confidence:{" "}
                    {event.confidence}%
                  </span>

                  <span>
                    Detection ID: #
                    {event.frameId}
                  </span>

                  <span>
                    Vehicle:{" "}
                    {selectedBus?.number ??
                      "BUS-001"}
                  </span>

                  <span className="truncate">
                    GPS: {event.gps}
                  </span>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <p className="rounded-xl2 border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                No live detections received yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}