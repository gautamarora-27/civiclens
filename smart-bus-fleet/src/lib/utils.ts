import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

/**
 * Generates a deterministic, dependency-free SVG placeholder image as a data URI.
 * Used instead of external image hosts so the demo works fully offline.
 */
export function placeholderImage(seed: string, w = 320, h = 180): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  const hue2 = (hue + 40) % 360;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue},55%,42%)"/>
        <stop offset="100%" stop-color="hsl(${hue2},55%,28%)"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <g opacity="0.18" stroke="white" stroke-width="2">
      <line x1="0" y1="${h * 0.35}" x2="${w}" y2="${h * 0.3}"/>
      <line x1="0" y1="${h * 0.7}" x2="${w}" y2="${h * 0.75}"/>
    </g>
    <circle cx="${w * 0.82}" cy="${h * 0.22}" r="${Math.min(w, h) * 0.08}" fill="white" opacity="0.15"/>
  </svg>`;
  const encoded =
    typeof window === "undefined"
      ? Buffer.from(svg).toString("base64")
      : window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
