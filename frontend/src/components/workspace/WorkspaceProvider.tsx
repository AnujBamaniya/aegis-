"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMockCase } from "@/hooks/useMockCase";
import type { EventType } from "@/lib/schema";
import { getState, subscribe } from "@/lib/briefingModule";

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
  /** Whether an AI briefing generation is currently in flight. */
  isBriefingRunning: boolean;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

/**
 * Shared selection/filter state for the Active Threats board (PLAN P2-P4).
 * Holds the selected event and the TC/FL/WF filter so map, chart and briefing
 * sections can consume the same workspace. Disables event switching while
 * a single-flight briefing is in progress.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const mockCase = useMockCase();
  const [filter, setFilterState] = useState<ThreatFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isBriefingRunning, setIsBriefingRunning] = useState<boolean>(() => getState().running);

  useEffect(() => {
    const unsub = subscribe(() => {
      setIsBriefingRunning(getState().running);
    });
    return unsub;
  }, []);

  const setFilter = useCallback((next: ThreatFilter) => {
    // If briefing is in progress, do not switch channel/selection
    if (getState().running) return;
    setFilterState(next);
    setSelectedId(null);
  }, []);

  const select = useCallback((id: string) => {
    // If briefing is in progress, selection is locked
    if (getState().running) return;
    setSelectedId(id);
  }, []);

  const value = useMemo<WorkspaceState>(
    () => ({ filter, setFilter, selectedId, select, mockCase, isBriefingRunning }),
    [filter, setFilter, selectedId, select, mockCase, isBriefingRunning],
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
