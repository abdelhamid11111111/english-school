"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

interface MarqueeOptions {
  /** Travel speed in CSS pixels per second. */
  speed?: number;
  /** Gap between items, in px — must match the flex `gap` on the track. */
  gap?: number;
}

/**
 * Seamless infinite marquee with a smooth hover pause.
 *
 * ## Why it never shows a seam
 *
 * The track renders the item list **twice**. `x` decreases continuously, and
 * the instant it passes `-(width of one copy + gap)` we add that distance back.
 * At that moment copy B occupies exactly the pixels copy A did, so the jump is
 * invisible — there is no reset frame, no fade, no snap.
 *
 * The wrap distance is measured from the live DOM via `ResizeObserver`, so it
 * survives font loading, responsive card widths and viewport changes. A
 * hard-coded width is what makes most marquee implementations drift.
 *
 * ## Why not a CSS keyframe or a Motion `repeat` tween
 *
 * Both can loop, but neither can be *decelerated* mid-flight. The brief asks
 * for a smooth pause on hover, so speed has to be a value we can ease. Here
 * the multiplier eases toward 0 on hover and back to 1 on leave, framerate
 * independently — the strip glides to a stop instead of freezing.
 *
 * Linear travel is intentional and is the one place on this page that uses it:
 * a marquee with an eased velocity visibly pulses.
 */
export function useMarquee<T extends HTMLElement = HTMLDivElement>({
  speed = 42,
  gap = 24,
}: MarqueeOptions = {}) {
  const copyRef = useRef<T | null>(null);
  const x = useMotionValue(0);
  const prefersReduced = useReducedMotion();

  const wrapWidth = useRef(0);
  const multiplier = useRef(1);
  const target = useRef(1);
  const [paused, setPaused] = useState(false);

  // Measure one copy of the list, including the gap that follows it.
  useEffect(() => {
    const node = copyRef.current;
    if (!node) return;

    const measure = () => {
      wrapWidth.current = node.getBoundingClientRect().width + gap;
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [gap]);

  useAnimationFrame((_, delta) => {
    if (prefersReduced || wrapWidth.current === 0) return;

    const seconds = delta / 1000;

    // Framerate-independent easing toward the target multiplier.
    const ease = 1 - Math.pow(0.004, seconds);
    multiplier.current += (target.current - multiplier.current) * ease;

    let next = x.get() - speed * seconds * multiplier.current;
    // Wrap by *adding* the period rather than resetting to 0, so any
    // sub-pixel remainder is carried over instead of being discarded.
    if (next <= -wrapWidth.current) next += wrapWidth.current;
    x.set(next);
  });

  const pause = useCallback(() => {
    target.current = 0;
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    target.current = 1;
    setPaused(false);
  }, []);

  return { x, copyRef, pause, resume, paused, isStatic: Boolean(prefersReduced) };
}
