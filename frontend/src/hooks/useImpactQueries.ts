"use client";

import { useQuery } from "@tanstack/react-query";
import { getInfrastructure, getPolygon } from "@/lib/dataSource";
import { useMockCase } from "@/hooks/useMockCase";
import type { AegisEvent } from "@/lib/adapters";

/**
 * Footprint + infrastructure queries (PLAN P3). Keyed by [type, id, episode],
 * retry x2 with backoff, enabled only while an event is selected. Polygon and
 * infrastructure state is tracked separately so a 404 in one never blocks
 * the other.
 */
export function useFootprintQuery(event: AegisEvent | null) {
  const mockCase = useMockCase();

  return useQuery({
    queryKey: ["aegis", "polygon", event?.type, event?.id, event?.episodeId, mockCase],
    queryFn: ({ signal }) => getPolygon(event!, { case: mockCase, signal }),
    enabled: event !== null,
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}

export function useInfrastructureQuery(event: AegisEvent | null) {
  const mockCase = useMockCase();

  return useQuery({
    queryKey: ["aegis", "infrastructure", event?.type, event?.id, event?.episodeId, mockCase],
    queryFn: ({ signal }) => getInfrastructure(event!, { case: mockCase, signal }),
    enabled: event !== null,
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}
