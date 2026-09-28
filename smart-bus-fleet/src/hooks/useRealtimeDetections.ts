"use client";

import { useEffect, useState } from "react";
import { Detection } from "@/lib/types";
import { fetchEvents } from "@/lib/api";
import { mockSocket } from "@/lib/socket";

export function useRealtimeDetections(maxItems = 20) {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [latestId, setLatestId] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      const initial = await fetchEvents(maxItems);
      setDetections(initial);

      unsub = mockSocket.subscribe((msg) => {
        if (msg.type === "detection") {
          setLatestId(msg.payload.id);
          setDetections((prev) => [msg.payload, ...prev].slice(0, maxItems));
        }
      });
    })();

    return () => {
      unsub?.();
    };
  }, [maxItems]);

  return { detections, latestId };
}
