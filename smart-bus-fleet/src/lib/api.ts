/**
 * API layer for Smart Bus Fleet Urban Sensing Platform.
 *
 * All calls point at the FastAPI backend contract below. Each function first
 * attempts a real network call; if the backend is unreachable (e.g. during
 * frontend-only demos), it falls back to generated mock data so the UI stays
 * fully functional.
 *
 * Backend endpoints:
 *   GET /api/v1/dashboard
 *   GET /api/v1/events
 *   GET /api/v1/incidents
 *   GET /api/v1/analytics
 *   GET /api/v1/buses
 *   GET /api/v1/realtime
 *   WS  /api/v1/ws
 */

import {
  generateBuses,
  generateDetections,
  generateIncidents,
  generateDefectClusters,
  generatePlaybackClips,
  generateServiceHealth,
  generateSystemMetrics,
} from "./mockData";
import { Bus, Detection, Incident, DefectCluster, PlaybackClip, KPISnapshot } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1";

async function safeFetch<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as T;
  } catch {
    // Backend not available in this demo build — use realistic mock data instead.
    return fallback();
  }
}

// Cache one generated fleet across mock calls so IDs stay consistent client-side.
let cachedBuses: Bus[] | null = null;
function mockBuses(): Bus[] {
  if (!cachedBuses) cachedBuses = generateBuses(24);
  return cachedBuses;
}

type BackendVehicle = {
  id: number;
  vehicle_id: string;
  route_name: string;
  latitude: number;
  longitude: number;
  status: string;
  last_seen: string;
};

export async function fetchBuses(): Promise<Bus[]> {
  const vehicles = await safeFetch<BackendVehicle[]>("/vehicles", () => []);

  return vehicles.map((vehicle) => ({
    id: String(vehicle.id),
    number: vehicle.vehicle_id,
    driver: "Not assigned",
    route: vehicle.route_name,
    routeId: vehicle.route_name,
    speedKmph: 0,

    position: {
      lat: vehicle.latitude,
      lng: vehicle.longitude,
    },

    heading: 0,

    gpsStatus:
      vehicle.status === "online" ? "healthy" : "offline",

    cameraStatus:
      vehicle.status === "online" ? "healthy" : "offline",

    aiStatus:
      vehicle.status === "online" ? "healthy" : "offline",

    lastUpdated: vehicle.last_seen,
    depot: "CivicLens Fleet",
  }));
}

export async function fetchDashboardKPIs(): Promise<KPISnapshot> {
  const data = await safeFetch<{
    total_detections: number;
    total_incidents: number;
    active_incidents: number;
    resolved_incidents: number;
    critical_incidents: number;
    open_work_orders: number;
  }>("/dashboard/summary", () => ({
    total_detections: 186,
    total_incidents: 42,
    active_incidents: 12,
    resolved_incidents: 30,
    critical_incidents: 3,
    open_work_orders: 5,
  }));

  return {
    activeBuses: 0,
    liveCameras: 0,
    eventsToday: data.total_detections,
    confirmedDefects: data.total_incidents,
    avgResponseMin: 0,
  };
}

export async function fetchEvents(count = 12): Promise<Detection[]> {
  return safeFetch<Detection[]>("/events", () => generateDetections(mockBuses(), count));
}

export async function fetchIncidents(): Promise<Incident[]> {
  return safeFetch<Incident[]>("/incidents", () => generateIncidents(mockBuses(), 40));
}

export async function fetchDefectClusters(): Promise<DefectCluster[]> {
  return safeFetch<DefectCluster[]>("/analytics/defects", () => generateDefectClusters(14));
}

export async function fetchPlaybackClips(): Promise<PlaybackClip[]> {
  return safeFetch<PlaybackClip[]>("/events/clips", () => generatePlaybackClips(18));
}

export async function fetchServiceHealth() {
  return safeFetch("/system/health", () => generateServiceHealth());
}

export async function fetchSystemMetrics() {
  return safeFetch("/system/metrics", () => generateSystemMetrics());
}

export async function loginRequest(email: string, password: string): Promise<{ token: string }> {
  return safeFetch<{ token: string }>("/auth/login", () => {
    if (!email || !password) throw new Error("Missing credentials");
    return { token: "demo-token" };
  });
}
