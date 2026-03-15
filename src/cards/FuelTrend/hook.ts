/**
 * @hook useFuelTrend
 * Fetches fuel reading history from the Cloudflare Worker API.
 * VITE_WORKER_URL must be set in .env.production for prod.
 * In dev, the vite proxy forwards /api → http://127.0.0.1:3001.
 */

import { useQuery } from "@tanstack/react-query";
import { POLL_INTERVAL_MS } from "../../lib/constants";

export interface FuelReading {
  ts: number;
  fuel: number;
}

// Empty string = relative URL, goes through vite proxy in dev, same-origin in prod
const BASE = import.meta.env.VITE_WORKER_URL ?? "";

export function useFuelTrend(limit = 288) {
  return useQuery<FuelReading[]>({
    queryKey: ["fuel-history", limit],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/history/fuel?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as FuelReading[];
      // API returns newest-first; reverse to oldest-first for charting
      return data.slice().reverse();
    },
    refetchInterval: POLL_INTERVAL_MS,
    staleTime:       POLL_INTERVAL_MS,
  });
}
