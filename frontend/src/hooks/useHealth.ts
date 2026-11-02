"use client";

import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/lib/dataSource";

const POLL_MS = 5 * 60 * 1000;

export type HealthWithLatency = {
  status: "online" | "offline";
  system: string;
  source: "demo" | "live";
  latencyMs: number | null;
};

/** Health probe + measured round-trip latency for the hero status card. */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async ({ signal }): Promise<HealthWithLatency> => {
      const startedAt = performance.now();
      const probe = await getHealth({ signal });
      return {
        ...probe,
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
      };
    },
    staleTime: 60_000,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}
