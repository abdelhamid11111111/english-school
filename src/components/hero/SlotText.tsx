"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
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
 * Slot text with a 3D roll.
 *
 * The headline is exactly two lines: the static "Speak English" above this
 * component, and one rotating line here, set entirely in the muted grey tone —
 * no colour shift, no highlight fill. `lead` and `mark` render identically;
 * they stay two fields (rather than one string) only because splitting the
 * final word is what a future re-introduction of emphasis would need, and it
 * costs nothing to keep the seam.
 *
 * ## The effect
 *
 * Each phrase sits on a face of an imaginary drum. The outgoing phrase rotates
 * up and away on X while the incoming one rolls up from below, both pushed back
 * on Z so they travel along a curve rather than a flat plane. `perspective` on
 * the container is what makes that read as depth instead of as a squash.
 *
 * ## Why nothing is clipped
 *
 * The obvious move is `overflow: hidden` on the container to mask the roll.
 * That breaks the effect: an overflow clip forces a flattening of the 3D
 * rendering context in every engine, so the children stop being positioned in
 * shared 3D space and the rotation collapses to a 2D squeeze.
 *
 * Instead the phrases are foreshortened to near-zero height (±72°) and faded
 * out before they can spill past the box, so no clip is needed.
 *
 * ## Sizing
 *
 * The slot inherits the h1's font-size and line-height — same visual weight as
 * the static "Speak English" line above it. Every phrase in `HERO_PHRASES`
 * (in `sections/Hero.tsx`) is **exactly three words total** — `lead` (two
 * words) plus `mark` (one word) — so the rendered line stays close to the
 * width "Speak English" already sets as the baseline, and never wraps inside
 * the h1's `max-w-[12ch]`.
 *
 * ## Layout stability
 *
 * The container is a fixed `1.1em` — one line at the h1's line-height (1.02),
 * with a hair of headroom. Both phrases are absolutely positioned inside it,
 * so a longer phrase cycling in can never reflow the paragraph below.
 *
 * ## Accessibility
 *
 * Text that rewrites itself every few seconds is hostile to a screen reader and
 * to anyone reading slowly. The whole component is `aria-hidden`; the h1 in
 * `Hero` carries one stable `sr-only` sentence as its accessible name. Under
 * `prefers-reduced-motion` the cycle never starts and the first phrase renders
 * statically.
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
      style={{
        // One line at the h1's inherited line-height (1.02), plus a sliver of
        // headroom.
        height: "1.1em",
        perspective: "1000px",
      }}
    >
      <AnimatePresence>
        <motion.span
          key={index}
          initial={{ rotateX: -72, y: "38%", z: -60, opacity: 0 }}
          animate={{ rotateX: 0, y: "0%", z: 0, opacity: 1 }}
          exit={{ rotateX: 72, y: "-38%", z: -60, opacity: 0 }}
          transition={{ duration: 0.85, ease: EASE_OUT_EXPO }}
          style={{ transformStyle: "preserve-3d" }}
          className="absolute inset-0 block will-animate"
        >
          {/* --ink-soft: the same muted grey used for body copy elsewhere,
              6.1:1 on --bg. No background fill — inline (no `block`) so
              `mark` continues on the same line as `lead`, not a class
              boundary a reader would notice. */}
          <span className="text-ink-soft">{phrase.lead} </span>
          <span className="text-ink-soft">{phrase.mark}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
