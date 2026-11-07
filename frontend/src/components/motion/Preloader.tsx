"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useLenis } from "./SmoothScroll";

const SESSION_KEY = "aegis:preloader:seen";

const FEED_STATES = [
  "FEED 15MIN",
  "FEED 5MIN",
  "FEED LIVE",
] as const;

const NODES_STATES = [
  "NODES 06",
  "NODES 12",
  "NODES 24",
] as const;

function dispatchPreloaderDone() {
  window.dispatchEvent(new CustomEvent("aegis:preloader:done"));
}

export function Preloader() {
  const { stop, start } = useLenis();
  const [phase, setPhase] = useState<"boot" | "exit">("boot");
  const rootRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef({ value: 0 });
  const feedIndexRef = useRef(0);
  const nodesIndexRef = useRef(0);
  const feedElRef = useRef<HTMLSpanElement>(null);
  const nodesElRef = useRef<HTMLSpanElement>(null);
  const syncElRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check reduced motion and session storage
    if (prefersReducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("exit");
      dispatchPreloaderDone();
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Ignore sessionStorage errors (e.g., private browsing)
    }

    if (seen) {
      setPhase("exit");
      dispatchPreloaderDone();
      return;
    }

    // Lock scroll while preloader is active
    stop();

    // Mark as seen for this session
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Ignore
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setPhase("exit");
          start(); // Unlock scroll
          dispatchPreloaderDone();
        },
      });

      // Sync counter: 0 → 100 over 0.7s
      tl.to(syncRef.current, {
        value: 100,
        duration: 0.7,
        ease: "power3.out",
        snap: { value: 1 },
        onUpdate: () => {
          if (syncElRef.current) {
            syncElRef.current.textContent = String(Math.round(syncRef.current.value)).padStart(3, "0");
          }
        },
      }, 0);

      // Progress bar: scaleX 0 → 1 in sync
      tl.to(barRef.current, {
        scaleX: 1,
        duration: 0.7,
        ease: "power3.out",
        transformOrigin: "left center",
      }, 0);

      // Feed state ticks
      tl.call(() => {
        feedIndexRef.current = 1;
        if (feedElRef.current) feedElRef.current.textContent = FEED_STATES[1];
      }).call(() => {
        feedIndexRef.current = 2;
        if (feedElRef.current) feedElRef.current.textContent = FEED_STATES[2];
      });

      // Nodes state ticks
      tl.call(() => {
        nodesIndexRef.current = 1;
        if (nodesElRef.current) nodesElRef.current.textContent = NODES_STATES[1];
      }).call(() => {
        nodesIndexRef.current = 2;
        if (nodesElRef.current) nodesElRef.current.textContent = NODES_STATES[2];
      });

      // Exit sequence: counter fades, then wipe away
      tl.to([syncElRef.current, feedElRef.current, nodesElRef.current], {
        opacity: 0,
        duration: 0.2,
      }, 0.7);

      tl.to(rootRef.current, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          setPhase("exit");
          start(); // Unlock scroll
          dispatchPreloaderDone();
        },
      }, 0.9);
    }, rootRef);

    return () => {
      ctx.revert();
      start(); // Ensure scroll is unlocked on cleanup
    };
  }, [stop, start]);

  if (phase === "exit") return null;

  return (
    <div
      ref={rootRef}
      data-preloader
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex items-end justify-between bg-obsidian-loam px-6 pb-6"
      style={{
        clipPath: "inset(0 0 0 0)",
      }}
    >
      {/* Bottom-left: SYNC counter */}
      <div className="font-mono text-[13px] text-lime-surveyor">
        SYNC <span ref={syncElRef} className="tabular-nums">000</span>%
      </div>

      {/* Bottom-right: FEED / NODES */}
      <div className="flex flex-col items-end gap-1 font-mono text-[13px] text-drift-ash">
        <span ref={feedElRef}>{FEED_STATES[0]}</span>
        <span ref={nodesElRef}>{NODES_STATES[0]}</span>
      </div>

      {/* Progress hairline at bottom */}
      <div
        ref={barRef}
        className="absolute bottom-0 left-0 right-0 h-px bg-lime-surveyor origin-left"
        style={{ transformOrigin: "left center", transform: "scaleX(0)" }}
      />
    </div>
  );
}
