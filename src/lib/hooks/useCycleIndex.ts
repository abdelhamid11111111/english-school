"use client";

import { useEffect, useState } from "react";

interface CycleIndexOptions {
  /** Number of items to cycle through. */
  length: number;
  /** Dwell time on each item, in ms. */
  intervalMs: number;
  /** When false the timer is torn down entirely (off-screen, paused, etc.). */
  active: boolean;
}

/**
 * Advances an index on a timer. Shared by the hero card deck and the slot text.
 *
 * A chained `setTimeout`, not `setInterval`: `setInterval` queues catch-up
 * ticks while a tab is throttled and fires them in a burst on return, which
 * shows up as several jump-cut advances at once. The chain also lets the
 * advance be *skipped* while `document.hidden` without breaking the rhythm —
 * the loop stays alive and resumes cleanly on focus.
 */
export function useCycleIndex({
  length,
  intervalMs,
  active,
}: CycleIndexOptions) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || length < 2) return;

    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = () => {
      timeout = setTimeout(() => {
        if (cancelled) return;
        if (!document.hidden) setIndex((current) => (current + 1) % length);
        schedule();
      }, intervalMs);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [active, intervalMs, length]);

  return { index, setIndex };
}
