"use client";

import { useRef } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useCycleIndex } from "@/lib/hooks/useCycleIndex";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/cn";

export interface SlotPhrase {
  /** First two words of the line. */
  readonly lead: string;
  /** Final word of the *same* line. Same tone as `lead` — see the component
   *  docstring for why this is still a separate field. */
  readonly mark: string;
}

interface SlotTextProps {
  phrases: readonly SlotPhrase[];
  /** Dwell time on each phrase, in ms. */
  intervalMs?: number;
  className?: string;
}

/**
 * Slot text as a "slam" transition.
 *
 * The headline is exactly two lines: the static "Speak English" above this
 * component, and one rotating line here, set entirely in the muted grey tone —
 * no colour shift, no highlight fill.
 *
 * ## The mechanic
 *
 * Two copies of the text overlap for the middle of the transition, not one
 * flat crossfade: the arriving phrase un-skews and rises into place while the
 * departing one continues skewing further and drops away beneath it, both
 * fading at the same time. That's what produces the brief double-exposure —
 * a bold, upright word settling in over a fainter, slanted, sinking copy of
 * the previous one — rather than a plain fade between two static states.
 *
 * `AnimatePresence`'s default mode lets the exiting and entering elements
 * animate concurrently (no `mode="wait"`), which is what makes the overlap
 * possible at all; `mode="wait"` would force one to finish before the other
 * starts and the two copies would never share a frame.
 *
 * The skew directions are mirrored — incoming leans one way and un-skews,
 * outgoing un-skews from the other way as it leaves — so the two copies read
 * as passing through each other rather than as duplicates of the same motion.
 *
 * ## Why nothing is clipped
 *
 * No `overflow: hidden` on the container: skewed text has diagonal corners
 * that a straight clip box would slice, which reads as a rendering bug rather
 * than a stylistic slant. The container's fixed height keeps the layout
 * stable regardless; the transform is free to bleed a few pixels past it
 * during the transition.
 *
 * ## Sizing
 *
 * The slot inherits the h1's font-size and line-height — same visual weight
 * as the static "Speak English" line above it. Every phrase in
 * `HERO_PHRASES` (in `sections/Hero.tsx`) is **exactly three words total** —
 * `lead` (two words) plus `mark` (one word) — so every phrase stays close to
 * the width "Speak English" already sets as the baseline, and none of them
 * wrap inside the h1's `max-w-[12ch]`.
 *
 * ## Accessibility
 *
 * Text that rewrites itself on a timer is hostile to a screen reader and to
 * anyone reading slowly. The whole component is `aria-hidden`; the h1 in
 * `Hero` carries one stable `sr-only` sentence as its accessible name. Under
 * `prefers-reduced-motion` the cycle never starts and the first phrase renders
 * statically, with no skew.
 */
export function SlotText({
  phrases,
  intervalMs = 3600,
  className,
}: SlotTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const prefersReduced = useReducedMotion();

  const { index } = useCycleIndex({
    length: phrases.length,
    intervalMs,
    active: inView && !prefersReduced,
  });

  const phrase = phrases[index];

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn("relative block", className)}
      style={{ height: "1.15em" }}
    >
      <AnimatePresence>
        <motion.span
          key={index}
          initial={
            prefersReduced
              ? false
              : { opacity: 0, y: "-30%", skewX: 12, skewY: -2 }
          }
          animate={{ opacity: 1, y: "0%", skewX: 0, skewY: 0 }}
          exit={{ opacity: 0, y: "32%", skewX: -14, skewY: 2 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="absolute inset-x-0 top-0 block origin-left will-animate"
        >
          {/* --ink-soft: the same muted grey used for body copy elsewhere,
              6.1:1 on --bg. No background fill — inline (no `block`) so
              `mark` continues on the same line as `lead`. */}
          <span className="text-ink-soft">{phrase.lead} </span>
          <span className="text-ink-soft">{phrase.mark}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
