/**
 * @hook useWorkerLatest
 * Fetches the most recent snapshot from the Cloudflare Worker API.
 * Returns ts, fuel, and solar_system_id from the latest D1 row.
 */

import { useQuery } from "@tanstack/react-query";
import { POLL_INTERVAL_MS } from "../lib/constants";

const BASE = import.meta.env.VITE_WORKER_URL ?? "";

export interface WorkerLatest {
  ts: number;
  fuel: number | null;
  solar_system_id: number | null;
}

export function useWorkerLatest() {
  return useQuery<WorkerLatest | null>({
    queryKey: ["worker-latest"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/history/latest`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<WorkerLatest | null>;
    },
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: POLL_INTERVAL_MS,
  });
}
