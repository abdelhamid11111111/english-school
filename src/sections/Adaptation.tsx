"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph } from "@/components/ui/Glyph";
import { Reveal } from "@/components/ui/Reveal";
import { PERSONAS } from "@/data/content";
import { EASE_FLUID, EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { Persona } from "@/types";

/**
 * "Built around you" — sticky scroll reveal over four learner personas.
 *
 * ## Why CSS sticky rather than GSAP pinning
 *
 * The Services section below needs true pinning (its panel must hold while an
 * internal timeline scrubs), so it uses ScrollTrigger. Here the panel only
 * needs to *stay put* — `position: sticky` does that natively, on the
 * compositor, with no pin-spacer, no layout thrash, and no teardown to manage.
 * Reaching for GSAP twice would cost bundle and complexity for no gain.
 *
 * ## How "active" is decided
 *
 * Each persona block observes a thin horizontal band across the middle of the
 * viewport (`margin: -45% 0 -45% 0` collapses the root to roughly a 10% strip).
 * Whichever block is crossing that strip is the active one. This is stable in
 * both scroll directions, unlike a threshold-based approach where two adjacent
 * blocks can qualify at once.
 */
export function Adaptation() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Background plate drifts against the sticky foreground — the parallax here
  // is between the decorative rings and the panel content that sits on them.
  const plateY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const plateRotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);

  const current = PERSONAS[active];

  return (
    <section
      id="approach"
      ref={sectionRef}
      className="relative scroll-mt-24"
      aria-labelledby="approach-heading"
    >
      <div className="shell">
        <div className="section-y pb-0">
          <Reveal>
            <Eyebrow>Who we teach</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2
              id="approach-heading"
              className="text-h2 text-balance-tight mt-6 max-w-[16ch]"
            >
              Four people walk in. Four different problems.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-lead text-ink-soft mt-6 max-w-[52ch]">
              A single syllabus can&apos;t serve all of them, so we don&apos;t
              pretend otherwise. Every track starts from what you already do in
              your own language and works toward doing it in this one.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          {/* -------------------------------------------- sticky panel --- */}
          {/* `self-start` is what makes sticky work inside a grid: without it
              the item stretches to the row height and has nothing to stick
              within. */}
          <div className="hidden lg:col-span-5 lg:block lg:self-start">
            <div className="sticky top-0 flex h-dvh items-center">
              <StickyPanel
                persona={current}
                plateY={prefersReduced ? undefined : plateY}
                plateRotate={prefersReduced ? undefined : plateRotate}
                activeIndex={active}
              />
            </div>
          </div>

          {/* ------------------------------------------ scrolling list --- */}
          <ol className="lg:col-span-7">
            {PERSONAS.map((persona, index) => (
              <PersonaBlock
                key={persona.id}
                persona={persona}
                index={index}
                isActive={index === active}
                onActivate={setActive}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

interface StickyPanelProps {
  persona: Persona;
  activeIndex: number;
  plateY?: MotionValue<string>;
  plateRotate?: MotionValue<number>;
}

function StickyPanel({
  persona,
  activeIndex,
  plateY,
  plateRotate,
}: StickyPanelProps) {
  return (
    <div className="relative w-full">
      {/* Background plate — the parallax layer. Concentric rings rather than a
          photo, so it never competes with the type. */}
      <motion.div
        aria-hidden
        style={{ y: plateY, rotate: plateRotate }}
        className="pointer-events-none absolute inset-0 grid place-items-center"
      >
        {[1, 0.74, 0.5].map((scale) => (
          <span
            key={scale}
            className="border-ink/[0.07] absolute aspect-square w-full rounded-full border"
            style={{ transform: `scale(${scale})` }}
          />
        ))}
      </motion.div>

      <div className="relative flex flex-col items-start">
        {/* Glyph well — double-bezel, with the illustration crossfading. */}
        <div className="bg-ink/[0.035] ring-ink/[0.06] rounded-bezel-lg p-2 ring-1 ring-inset">
          <div className="bg-surface rounded-core-lg shadow-[inset_0_1px_1px_rgb(255_255_255/0.7)] relative grid size-32 place-items-center overflow-hidden">
            {/* Slowly rotating dashed ring — one continuous CSS-free motion,
                driven by Motion so it inherits reduced-motion handling. */}
            <motion.span
              aria-hidden
              className="border-ink/12 absolute size-24 rounded-full border border-dashed"
              animate={{ rotate: 360 }}
              transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={persona.id}
                initial={{ opacity: 0, scale: 0.72, rotateX: -35, y: 12 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, scale: 1.14, rotateX: 25, y: -12 }}
                transition={{ duration: 0.62, ease: EASE_OUT_EXPO }}
                // A little perspective turns the swap into a card flipping in
                // space rather than a flat crossfade.
                style={{ transformPerspective: 600 }}
                className="text-brand relative"
              >
                <Glyph name={persona.glyph} className="size-12" weight={1} />
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-10 min-h-[13rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: EASE_FLUID }}
            >
              <p className="text-micro text-accent-ink font-medium uppercase">
                {persona.index} — {persona.label}
              </p>
              <p className="font-display text-h3 text-ink mt-4 max-w-[17ch]">
                {persona.title}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress rail. */}
        <ul className="mt-8 flex w-full max-w-xs gap-2" aria-hidden>
          {PERSONAS.map((p, i) => (
            <li key={p.id} className="bg-ink/10 h-[2px] flex-1 overflow-hidden">
              <motion.span
                className="bg-ink block h-full origin-left"
                initial={false}
                animate={{ scaleX: i <= activeIndex ? 1 : 0 }}
                transition={{ duration: 0.7, ease: EASE_FLUID }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface PersonaBlockProps {
  persona: Persona;
  index: number;
  isActive: boolean;
  onActivate: (index: number) => void;
}

function PersonaBlock({
  persona,
  index,
  isActive,
  onActivate,
}: PersonaBlockProps) {
  const ref = useRef<HTMLLIElement | null>(null);
  // Collapses the observer root to a ~10% band across the viewport middle.
  const inBand = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (inBand) onActivate(index);
  }, [inBand, index, onActivate]);

  return (
    <li
      ref={ref}
      className="border-line flex min-h-[62vh] flex-col justify-center border-b py-14 last:border-b-0 lg:min-h-[80vh] lg:py-20"
    >
      <motion.div
        // Inactive blocks recede rather than disappear — the reader keeps
        // their place in the list while attention moves to the active one.
        animate={{
          opacity: isActive ? 1 : 0.42,
          filter: isActive ? "blur(0px)" : "blur(1.5px)",
        }}
        transition={{ duration: 0.7, ease: EASE_FLUID }}
      >
        <div className="flex items-center gap-4">
          {/* Inline glyph for mobile, where the sticky panel is hidden. */}
          <span
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-full transition-colors duration-700 ease-fluid lg:hidden",
              isActive ? "bg-accent text-ink" : "bg-ink/5 text-ink-soft",
            )}
          >
            <Glyph name={persona.glyph} className="size-5" />
          </span>
          <span className="text-micro text-ink-soft font-medium uppercase">
            {persona.index} — {persona.label}
          </span>
        </div>

        <h3 className="text-h3 text-ink mt-6 max-w-[20ch] lg:hidden">
          {persona.title}
        </h3>

        <p className="text-lead text-ink-soft mt-6 max-w-[48ch]">
          {persona.description}
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {persona.outcomes.map((outcome, i) => (
            <motion.li
              key={outcome}
              className="text-ink flex items-start gap-3 text-[0.9375rem] leading-relaxed"
              initial={false}
              animate={{
                x: isActive ? 0 : -8,
                opacity: isActive ? 1 : 0.6,
              }}
              transition={{
                duration: 0.6,
                ease: EASE_FLUID,
                delay: isActive ? i * 0.07 : 0,
              }}
            >
              <span
                aria-hidden
                className="bg-accent-strong mt-[0.6em] size-1.5 shrink-0 rounded-full"
              />
              {outcome}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </li>
  );
}
