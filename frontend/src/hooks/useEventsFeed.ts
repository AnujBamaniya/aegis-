"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/lib/dataSource";
import { useMockCase } from "@/hooks/useMockCase";

const POLL_MS = 5 * 60 * 1000; // 5 min polling (PLAN: Data rules).

/**
 * Events feed hook (PLAN P2): 5-minute polling that pauses when the tab is
 * hidden, retries x2 with exponential backoff. All UI reads go through
 * `getEvents` in `dataSource.ts` — never fetch directly from components.
 */
export function useEventsFeed() {
  const mockCase = useMockCase();

  return useQuery({
    queryKey: ["events", mockCase],
    queryFn: ({ signal }) => getEvents({ case: mockCase, signal }),
    staleTime: 60_000,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false, // pauses while the tab is hidden
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}
