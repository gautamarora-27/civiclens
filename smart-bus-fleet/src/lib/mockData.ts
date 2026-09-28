import {
  Bus,
  Route,
  Detection,
  Incident,
  DefectCluster,
  PlaybackClip,
  EventType,
  ServiceHealth,
  SystemMetric,
  UserProfile,
} from "./types";
import { pickRandom, randomBetween } from "./utils";

// City center: Indore, MP (realistic mid-size Smart City Mission bus network)
export const CITY_NAME = "Indore";
export const CITY_CENTER = { lat: 22.7196, lng: 75.8577 };

export const EVENT_TYPES: EventType[] = [
  "Pothole",
  "Road Crack",
  "Garbage",
  "Waterlogging",
  "Traffic Congestion",
  "Accident",
  "Illegal Parking",
];

export const AREAS = [
  "Vijay Nagar",
  "Rajwada",
  "MG Road",
  "Bhawarkuan",
  "Palasia",
  "Rau Circle",
  "Ring Road",
  "AB Road",
  "Sapna Sangeeta",
  "Bapat Square",
  "Geeta Bhawan",
  "Kanadia Road",
];

export const ROUTES: Route[] = [
  { id: "R-12", name: "Route 12 - Rajwada to Vijay Nagar", points: [], busyRank: 1 },
  { id: "R-07", name: "Route 07 - Bhawarkuan to Rau", points: [], busyRank: 2 },
  { id: "R-21", name: "Route 21 - AB Road Express", points: [], busyRank: 3 },
  { id: "R-05", name: "Route 05 - Palasia Circular", points: [], busyRank: 4 },
  { id: "R-18", name: "Route 18 - Ring Road Loop", points: [], busyRank: 5 },
  { id: "R-09", name: "Route 09 - Geeta Bhawan Link", points: [], busyRank: 6 },
  { id: "R-14", name: "Route 14 - Kanadia Feeder", points: [], busyRank: 7 },
  { id: "R-03", name: "Route 03 - MG Road Shuttle", points: [], busyRank: 8 },
];

const DRIVERS = [
  "Rakesh Yadav",
  "Suresh Patel",
  "Anil Verma",
  "Mahesh Chouhan",
  "Vikram Solanki",
  "Deepak Rathore",
  "Sanjay Malviya",
  "Ramesh Gupta",
  "Ashok Tiwari",
  "Naveen Joshi",
  "Ravi Sharma",
  "Prakash Bhargava",
];

const DEPOTS = ["Vijay Nagar Depot", "Rau Depot", "Bhawarkuan Depot", "Ring Road Depot"];

function jitter(center: number, spread: number) {
  return center + randomBetween(-spread, spread);
}

function randomRoutePoints(): { lat: number; lng: number }[] {
  const pts = [];
  let lat = jitter(CITY_CENTER.lat, 0.05);
  let lng = jitter(CITY_CENTER.lng, 0.05);
  for (let i = 0; i < 6; i++) {
    lat += randomBetween(-0.01, 0.01);
    lng += randomBetween(-0.01, 0.01);
    pts.push({ lat, lng });
  }
  return pts;
}

ROUTES.forEach((r) => (r.points = randomRoutePoints()));

function healthWeighted(): "healthy" | "weak" | "offline" {
  const r = Math.random();
  if (r < 0.82) return "healthy";
  if (r < 0.95) return "weak";
  return "offline";
}

export function generateBuses(count = 24): Bus[] {
  const buses: Bus[] = [];
  for (let i = 0; i < count; i++) {
    const route = pickRandom(ROUTES);
    const base = pickRandom(route.points);
    buses.push({
      id: `bus-${i + 1}`,
      number: `MP09-${(1000 + i).toString().slice(-4)}`,
      driver: pickRandom(DRIVERS),
      route: route.name,
      routeId: route.id,
      speedKmph: Math.round(randomBetween(0, 48)),
      position: { lat: jitter(base.lat, 0.004), lng: jitter(base.lng, 0.004) },
      heading: Math.round(randomBetween(0, 359)),
      gpsStatus: healthWeighted(),
      cameraStatus: healthWeighted(),
      aiStatus: healthWeighted(),
      lastUpdated: new Date().toISOString(),
      depot: pickRandom(DEPOTS),
    });
  }
  return buses;
}

export function generateDetection(buses: Bus[]): Detection {
  const bus = pickRandom(buses);
  const eventType = pickRandom(EVENT_TYPES);
  return {
    id: `det-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    busId: bus.id,
    busNumber: bus.number,
    route: bus.route,
    timestamp: new Date().toISOString(),
    confidence: Math.round(randomBetween(72, 99)),
    eventType,
    location: pickRandom(AREAS),
    position: bus.position,
    thumbnailSeed: `${eventType}-${bus.id}-${Date.now()}`,
  };
}

export function generateDetections(buses: Bus[], count = 12): Detection[] {
  return Array.from({ length: count }, () => generateDetection(buses));
}

function severityFor(eventType: EventType): Incident["severity"] {
  if (eventType === "Accident") return "Critical";
  if (eventType === "Waterlogging" || eventType === "Traffic Congestion") return "High";
  if (eventType === "Pothole" || eventType === "Road Crack") return pickRandom(["Medium", "High"]);
  return pickRandom(["Low", "Medium"]);
}

export function generateIncidents(buses: Bus[], count = 40): Incident[] {
  const statuses: Incident["status"][] = ["Pending", "Under Review", "Confirmed", "Resolved"];
  return Array.from({ length: count }, (_, i) => {
    const bus = pickRandom(buses);
    const eventType = pickRandom(EVENT_TYPES);
    const status = pickRandom(statuses);
    const hoursAgo = Math.floor(randomBetween(0, 96));
    const time = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
    return {
      id: `INC-${1000 + i}`,
      category: eventType,
      severity: severityFor(eventType),
      busId: bus.id,
      busNumber: bus.number,
      area: pickRandom(AREAS),
      time,
      status,
      confidence: Math.round(randomBetween(70, 99)),
      position: bus.position,
      aiSummary: summaryFor(eventType, bus.route),
      resolutionNotes: status === "Resolved" ? "Verified by field team and marked closed after repair crew visit." : undefined,
      nearbyBuses: buses
        .filter((b) => b.id !== bus.id)
        .slice(0, 3)
        .map((b) => b.number),
      imageSeed: `${eventType}-${i}`,
    };
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

function summaryFor(eventType: EventType, route: string): string {
  const map: Record<EventType, string> = {
    Pothole: `AI model flagged a medium-depth pothole on the carriageway along ${route}. Recommend maintenance crew dispatch within 48 hours.`,
    "Road Crack": `Longitudinal surface crack detected spanning approx. 1.2m along ${route}. Low immediate risk, monitor for widening.`,
    Garbage: `Uncollected garbage accumulation detected near roadside on ${route}. Suggest notifying municipal sanitation team.`,
    Waterlogging: `Waterlogging detected covering partial lane width on ${route}, likely due to blocked drainage. Flagged as high priority.`,
    "Traffic Congestion": `Sustained low average speed detected across multiple buses on ${route}, indicating congestion buildup.`,
    Accident: `Possible accident detected — sudden deceleration and object pattern matched near ${route}. Immediate verification required.`,
    "Illegal Parking": `Vehicle detected parked in a no-parking zone obstructing traffic flow on ${route}.`,
    Encroachment: `Public-space encroachment detected along ${route}. Recommend field verification and enforcement review.`,
  };
  return map[eventType];
}

export function generateDefectClusters(count = 14): DefectCluster[] {
  const eventTypes: EventType[] = ["Pothole", "Road Crack", "Waterlogging", "Garbage"];
  return Array.from({ length: count }, (_, i) => {
    const eventType = pickRandom(eventTypes);
    const reportingBuses = Math.round(randomBetween(1, 7));
    const daysAgo = Math.floor(randomBetween(1, 20));
    const firstSeen = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const lastSeen = new Date(Date.now() - Math.floor(randomBetween(0, daysAgo)) * 86400000).toISOString();
    const status: DefectCluster["status"] =
      reportingBuses >= 3 ? (Math.random() > 0.8 ? "Resolved" : "Confirmed") : "Awaiting Verification";
    return {
      id: `DEF-${200 + i}`,
      eventType,
      area: pickRandom(AREAS),
      position: { lat: jitter(CITY_CENTER.lat, 0.05), lng: jitter(CITY_CENTER.lng, 0.05) },
      reportingBuses,
      firstSeen,
      lastSeen,
      confidence: Math.round(randomBetween(75, 98)),
      imageSeed: `defect-${i}`,
      status,
      beforeImageSeed: status === "Resolved" ? `before-${i}` : undefined,
      afterImageSeed: status === "Resolved" ? `after-${i}` : undefined,
    };
  });
}

export function generatePlaybackClips(count = 18): PlaybackClip[] {
  return Array.from({ length: count }, (_, i) => {
    const eventType = pickRandom(EVENT_TYPES);
    const daysAgo = Math.floor(randomBetween(0, 14));
    return {
      id: `CLIP-${400 + i}`,
      eventType,
      durationSec: Math.round(randomBetween(8, 45)),
      route: pickRandom(ROUTES).name,
      busNumber: `MP09-${(1000 + Math.floor(randomBetween(0, 24))).toString().slice(-4)}`,
      date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      thumbnailSeed: `clip-${eventType}-${i}`,
    };
  });
}

export function generateServiceHealth(): ServiceHealth[] {
  return [
    { name: "PostgreSQL", status: "Online", detail: "Primary + 1 replica, 4ms avg query latency" },
    { name: "MQTT Broker", status: "Online", detail: "1,842 msgs/min across 24 bus topics" },
    { name: "AI Detector Service", status: "Online", detail: "GPU inference cluster, 3 workers active" },
    { name: "YOLO Model", status: "Warning", detail: "v8.2 running, v8.3 update pending rollout" },
    { name: "Object Storage", status: "Online", detail: "62% capacity used, auto-archival enabled" },
    { name: "WebSocket Gateway", status: "Online", detail: "24 active connections, 0 dropped in 1h" },
  ];
}

export function generateSystemMetrics(): SystemMetric[] {
  return [
    { label: "CPU Usage", percent: Math.round(randomBetween(35, 70)) },
    { label: "RAM Usage", percent: Math.round(randomBetween(40, 80)) },
    { label: "Storage Usage", percent: Math.round(randomBetween(50, 75)) },
  ];
}

export const DEMO_USER: UserProfile = {
  name: "Ananya Deshmukh",
  email: "ananya.deshmukh@indoresmartcity.gov.in",
  role: "Fleet Operations Analyst",
  city: `${CITY_NAME} Municipal Corporation`,
  avatarInitials: "AD",
};

// --- Analytics helpers ---
export function eventsByCategory() {
  return EVENT_TYPES.map((type) => ({
    category: type,
    count: Math.round(randomBetween(20, 220)),
  }));
}

export function hourlyDetectionTrend() {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    detections: Math.round(30 + 40 * Math.sin((h / 24) * Math.PI * 2 - 1) + randomBetween(-8, 8)),
  }));
}

export function defectsByZone() {
  return AREAS.slice(0, 7).map((area) => ({
    area,
    value: Math.round(randomBetween(10, 90)),
  }));
}

export function topBusyRoutes() {
  return ROUTES.map((r) => ({
    route: r.name.split(" - ")[0],
    trips: Math.round(randomBetween(80, 260)),
  })).sort((a, b) => b.trips - a.trips);
}

export function congestionByTime() {
  return Array.from({ length: 12 }, (_, i) => {
    const hour = i * 2;
    return {
      time: `${hour.toString().padStart(2, "0")}:00`,
      congestionIndex: Math.round(randomBetween(15, 95)),
    };
  });
}

export function aiAccuracyTrend() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      accuracy: Math.round(randomBetween(89, 97)),
    };
  });
}
