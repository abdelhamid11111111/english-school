"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { useCycleIndex } from "./useCycleIndex";

interface CardCycleOptions {
  /** Total cards in the deck. */
  length: number;
  /** Dwell time on each card, in ms. */
  intervalMs?: number;
  /** How many cards are visible in the stack at once. */
  visible?: number;
}

/**
 * Drives the hero's auto-cycling card deck.
 *
 * Timing comes from `useCycleIndex`; this hook adds the deck-specific parts:
 *
 * - It pauses when the hero scrolls out of view and on hover/focus, so an
 *   off-screen animation is never burning frames and a reader can finish a
 *   card.
 *
 * - It returns the *window* of visible cards rather than a single index, so the
 *   consumer can render a fixed number of slots and let AnimatePresence handle
 *   the enter/exit. That is what removes the wrap-around jump: the card leaving
 *   the front is unmounted and animated up and out, while a fresh card mounts
 *   at the back of the stack — no element ever teleports between slots.
 *
 * - Under `prefers-reduced-motion` the timer never starts and the deck renders
 *   as a static stack.
 */
export function useCardCycle<T>(
  items: readonly T[],
  { length, intervalMs = 3400, visible = 3 }: CardCycleOptions,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const prefersReduced = useReducedMotion();
  const [paused, setPaused] = useState(false);

  const { index: active, setIndex } = useCycleIndex({
    length,
    intervalMs,
    active: inView && !paused && !prefersReduced,
  });

  /** The visible window, front-most first. Each entry keeps its source index. */
  const stack = Array.from({ length: Math.min(visible, length) }, (_, slot) => {
    const index = (active + slot) % length;
    return { item: items[index], index, slot };
  });

  return {
    containerRef,
    active,
    stack,
    /** Hover/focus pause — the deck stops so a reader can finish a card. */
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    goTo: (index: number) => setIndex(index % length),
    isStatic: Boolean(prefersReduced),
  };
}
