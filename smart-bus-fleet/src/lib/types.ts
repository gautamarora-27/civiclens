// Core domain types for the Smart Bus Fleet Urban Sensing Platform

export type EventType =
  | "Pothole"
  | "Road Crack"
  | "Garbage"
  | "Waterlogging"
  | "Encroachment"
  | "Traffic Congestion"
  | "Accident"
  | "Illegal Parking";

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type IncidentStatus = "Pending" | "Under Review" | "Confirmed" | "Resolved";

export type HealthStatus = "healthy" | "weak" | "offline";

export type ServiceStatus = "Online" | "Offline" | "Warning";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Bus {
  id: string;
  number: string;
  driver: string;
  route: string;
  routeId: string;
  speedKmph: number;
  position: GeoPoint;
  heading: number; // degrees
  gpsStatus: HealthStatus;
  cameraStatus: HealthStatus;
  aiStatus: HealthStatus;
  lastUpdated: string;
  depot: string;
}

export interface Route {
  id: string;
  name: string;
  points: GeoPoint[];
  busyRank?: number;
}

export interface Detection {
  id: string;
  busId: string;
  busNumber: string;
  route: string;
  timestamp: string;
  confidence: number;
  eventType: EventType;
  location: string;
  position: GeoPoint;
  thumbnailSeed: string;
}

export interface Incident {
  id: string;
  category: EventType;
  severity: Severity;
  busId: string;
  busNumber: string;
  area: string;
  time: string;
  status: IncidentStatus;
  confidence: number;
  position: GeoPoint;
  aiSummary: string;
  resolutionNotes?: string;
  nearbyBuses: string[];
  imageSeed: string;
}

export interface DefectCluster {
  id: string;
  eventType: EventType;
  area: string;
  position: GeoPoint;
  reportingBuses: number;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
  imageSeed: string;
  status: "Confirmed" | "Awaiting Verification" | "Resolved";
  beforeImageSeed?: string;
  afterImageSeed?: string;
}

export interface PlaybackClip {
  id: string;
  eventType: EventType;
  durationSec: number;
  route: string;
  busNumber: string;
  date: string;
  thumbnailSeed: string;
}

export interface KPISnapshot {
  activeBuses: number;
  liveCameras: number;
  eventsToday: number;
  confirmedDefects: number;
  avgResponseMin: number;
}

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  detail: string;
}

export interface SystemMetric {
  label: string;
  percent: number;
}

export interface ChartRangeOption {
  label: "Today" | "Week" | "Month";
  value: "today" | "week" | "month";
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  city: string;
  avatarInitials: string;
}
