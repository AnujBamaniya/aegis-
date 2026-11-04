import { getBriefing, type RequestOpts } from "./dataSource";
import type { AegisBriefing } from "./adapters";
import type { EventType } from "./schema";

export type EventRef = { type: EventType; id: string; episodeId: string };

export type BriefingCacheEntry = {
  result: AegisBriefing;
  timestamp: number;
};

const cache = new Map<string, BriefingCacheEntry>();

export function getCacheKey(event: EventRef, mockCase?: string): string {
  const caseSuffix = mockCase ? `:${mockCase}` : "";
  return `${event.type}:${event.id}:${event.episodeId}${caseSuffix}`;
}

export function getCached(event: EventRef, mockCase?: string): AegisBriefing | null {
  const entry = cache.get(getCacheKey(event, mockCase));
  return entry ? entry.result : null;
}

export function setCache(event: EventRef, result: AegisBriefing, mockCase?: string): void {
  cache.set(getCacheKey(event, mockCase), { result, timestamp: Date.now() });
}

export function invalidateCache(event: EventRef, mockCase?: string): void {
  cache.delete(getCacheKey(event, mockCase));
  notify();
}

export function hasCache(event: EventRef, mockCase?: string): boolean {
  return cache.has(getCacheKey(event, mockCase));
}

export function clearCache(): void {
  cache.clear();
  notify();
}

export type BriefingState = {
  running: boolean;
  controller: AbortController | null;
  startedAt: number | null;
  error: string | null;
  currentEvent: EventRef | null;
};

let state: BriefingState = {
  running: false,
  controller: null,
  startedAt: null,
  error: null,
  currentEvent: null,
};

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getState(): BriefingState {
  return state;
}

function notify() {
  listeners.forEach((l) => l());
}

function setState(next: Partial<BriefingState>) {
  state = { ...state, ...next };
  notify();
}

export function clearError(): void {
  if (state.error) {
    setState({ error: null });
  }
}

export async function runBriefing(
  event: EventRef,
  opts: RequestOpts = {},
): Promise<AegisBriefing> {
  // Single-flight: ignore if already running
  if (state.running) {
    throw new Error("Briefing in progress. The backend handles one request at a time.");
  }

  // Check cache
  const cached = getCached(event, opts.case);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  setState({
    running: true,
    controller,
    startedAt: Date.now(),
    error: null,
    currentEvent: event,
  });

  try {
    const result = await getBriefing(event, { ...opts, signal: controller.signal });
    setCache(event, result, opts.case);
    setState({
      running: false,
      controller: null,
      startedAt: null,
      error: null,
      currentEvent: null,
    });
    return result;
  } catch (err) {
    let message = "Briefing service unavailable";
    if (err instanceof Error) {
      if (err.name === "AbortError" || err.message.toLowerCase().includes("aborted")) {
        setState({
          running: false,
          controller: null,
          startedAt: null,
          error: null,
          currentEvent: null,
        });
        throw err;
      }
      message = err.message || "Briefing service unavailable";
    }
    setState({
      running: false,
      controller: null,
      startedAt: null,
      error: message,
      currentEvent: null,
    });
    throw new Error(message);
  }
}

export function cancel(): boolean {
  if (state.controller) {
    state.controller.abort();
    setState({
      running: false,
      controller: null,
      startedAt: null,
      error: null,
      currentEvent: null,
    });
    return true;
  }
  return false;
}
