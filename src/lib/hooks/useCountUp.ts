"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface CountUpOptions {
  value: number;
  decimals?: number;
  durationMs?: number;
}

/**
 * Counts from 0 to `value` once the element scrolls into view.
 *
 * Driven by `requestAnimationFrame` with an expo-out curve rather than a
 * `setInterval` tick, so the number decelerates instead of climbing linearly —
 * a linear counter is the tell of a cheap implementation.
 *
 * Returns a ref to attach and the formatted string to render.
 */
export function useCountUp({
  value,
  decimals = 0,
  durationMs = 1800,
}: CountUpOptions) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Under reduced motion there is nothing to animate — the final value is
    // derived below instead, which avoids a synchronous setState in an effect
    // (and the extra render pass that comes with it).
    if (!inView || prefersReduced) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // Expo-out: fast off the mark, long settle into the final number.
      const eased = 1 - Math.pow(2, -10 * progress);
      setDisplay(value * (progress === 1 ? 1 : eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, durationMs, prefersReduced]);

  // Reduced motion jumps straight to the final figure once it's on screen.
  const shown = prefersReduced ? (inView ? value : 0) : display;

  const formatted = shown.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return { ref, formatted };
}
