"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMockCase } from "@/hooks/useMockCase";
import type { EventType } from "@/lib/schema";

export type ThreatFilter = "ALL" | EventType;

type WorkspaceState = {
  /** TC/FL/WF channel filter, or ALL. */
  filter: ThreatFilter;
  setFilter: (filter: ThreatFilter) => void;
  /** Currently selected event id, or null when the board falls back. */
  selectedId: string | null;
  select: (id: string) => void;
  /** Active `?case=` scenario (mock mode). */
  mockCase: string;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

/**
 * Shared selection/filter state for the Active Threats board (PLAN P2).
 * Holds the selected event and the TC/FL/WF filter so map, chart and briefing
 * sections can consume the same workspace later.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const mockCase = useMockCase();
  const [filter, setFilterState] = useState<ThreatFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const setFilter = useCallback((next: ThreatFilter) => {
    setFilterState(next);
    setSelectedId(null); // fall back to the first event of the new channel
  }, []);

  const select = useCallback((id: string) => setSelectedId(id), []);

  const value = useMemo<WorkspaceState>(
    () => ({ filter, setFilter, selectedId, select, mockCase }),
    [filter, setFilter, selectedId, select, mockCase],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceState {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}

/**
 * Read-mostly subscription for components that only need the selection
 * (avoids re-renders when the filter flips).
 */
export function useWorkspaceSelectedId(): string | null {
  return useContext(WorkspaceContext)?.selectedId ?? null;
}
