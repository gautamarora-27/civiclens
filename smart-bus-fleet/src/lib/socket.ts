"use client";

/**
 * Mock WebSocket service for `WS /api/v1/ws`.
 *
 * In production this module would open a real WebSocket connection and
 * forward parsed messages to subscribers. Since no backend is attached in
 * this demo build, it simulates the same message shapes on a timer so every
 * page behaves identically once a real socket is wired in — just swap the
 * `connect()` internals.
 */

import { Bus, Detection } from "./types";
import { generateDetection } from "./mockData";
import { clamp, randomBetween } from "./utils";

export type RealtimeMessage =
  | { type: "bus_update"; payload: Bus[] }
  | { type: "detection"; payload: Detection }
  | { type: "kpi_tick"; payload: { eventsDelta: number } };

type Listener = (msg: RealtimeMessage) => void;

class MockSocketService {
  private listeners = new Set<Listener>();
  private buses: Bus[] = [];
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private connected = false;

  init(initialBuses: Bus[]) {
    this.buses = initialBuses;
  }

  connect() {
    if (this.connected) return;
    this.connected = true;
    // Simulates the WS /api/v1/ws stream at a 3–5s cadence.
    this.intervalHandle = setInterval(() => {
      this.tickBuses();
      if (Math.random() > 0.35) {
        this.emit({ type: "detection", payload: generateDetection(this.buses) });
      }
      this.emit({ type: "kpi_tick", payload: { eventsDelta: Math.random() > 0.5 ? 1 : 0 } });
    }, 3500);
  }

  disconnect() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
    this.connected = false;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(msg: RealtimeMessage) {
    this.listeners.forEach((l) => l(msg));
  }

  private tickBuses() {
    this.buses = this.buses.map((bus) => {
      if (bus.gpsStatus === "offline") return bus;
      const headingRad = (bus.heading * Math.PI) / 180;
      const distance = (bus.speedKmph / 3600) * 4 * 0.01; // rough degrees-per-tick
      return {
        ...bus,
        position: {
          lat: bus.position.lat + Math.cos(headingRad) * distance,
          lng: bus.position.lng + Math.sin(headingRad) * distance,
        },
        heading: clamp(bus.heading + randomBetween(-8, 8), 0, 359),
        speedKmph: Math.round(clamp(bus.speedKmph + randomBetween(-6, 6), 0, 55)),
        lastUpdated: new Date().toISOString(),
      };
    });
    this.emit({ type: "bus_update", payload: this.buses });
  }

  getBuses(): Bus[] {
    return this.buses;
  }
}

export const mockSocket = new MockSocketService();
