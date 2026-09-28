"use client";

import { useEffect, useState } from "react";
import { Bus } from "@/lib/types";
import { fetchBuses } from "@/lib/api";

export function useRealtimeBuses() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuses = async () => {
      const data = await fetchBuses();
      setBuses(data);
      setLoading(false);
    };

    loadBuses();

    const interval = setInterval(loadBuses, 5000);

    return () => clearInterval(interval);
  }, []);

  return { buses, loading };
}