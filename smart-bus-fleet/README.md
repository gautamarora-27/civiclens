# Smart Bus Fleet Urban Sensing Platform — Frontend

A Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for an AI-powered municipal
bus fleet monitoring platform, built for a Smart India Hackathon demonstration.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` — use
**Continue as Demo** to skip straight into the dashboard.

## Project Structure

```
src/
  app/                 # Route segments (App Router)
    login/
    dashboard/
    live-detection/
    fleet/
      [busId]/
    incidents/
    road-verification/
    analytics/
    playback/
    system-health/
    settings/
  components/
    layout/            # Sidebar, Topbar, AppShell
    ui/                 # Reusable UI: KPICard, BusCard, DetectionCard, MapComponent, etc.
  context/              # Theme + notification providers
  hooks/                # useRealtimeBuses, useRealtimeDetections
  lib/
    api.ts              # API layer (falls back to mock data if backend is offline)
    socket.ts           # Mock WebSocket service simulating WS /api/v1/ws
    mockData.ts         # Realistic Indore (Indore Municipal Corporation) bus/route data
    types.ts            # Shared TypeScript types
    utils.ts            # Formatting + placeholder-image helpers
```

## Connecting to the Real Backend

Set `NEXT_PUBLIC_API_BASE_URL` in a `.env.local` file to your FastAPI backend's base URL:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com/api/v1
```

Every function in `src/lib/api.ts` will call the real endpoint first and only fall back to
mock data if the request fails — so the frontend works standalone during development and
switches over seamlessly once the backend is live.

To wire up the real-time layer, replace the internals of `src/lib/socket.ts` with an actual
`WebSocket` connection to `WS /api/v1/ws`; the message shapes (`bus_update`, `detection`,
`kpi_tick`) are already defined and consumed by `useRealtimeBuses` / `useRealtimeDetections`.

## Notes

- The city map is a dependency-free custom SVG component (`MapComponent`) rather than a
  tile-based map library, so the whole app runs fully offline with no API keys required.
  Swap it for Leaflet/Mapbox by keeping the same `buses` / `pins` prop contract.
- All camera thumbnails and video frames are generated as deterministic SVG placeholders
  (`placeholderImage`) — no external image hosts are required.
- Dark mode is class-based (`darkMode: "class"` in `tailwind.config.ts`) and persisted to
  `localStorage`.
