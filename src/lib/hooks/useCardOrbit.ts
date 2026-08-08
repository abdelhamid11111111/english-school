"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { EASE_FLUID, EASE_OUT_EXPO } from "@/lib/motion";

/** One full revolution of the orbit. */
const REVOLUTION_MS = 16000;
const BASE_SPEED = 1 / REVOLUTION_MS; // progress units per ms

/** How long the orbit takes to ease to a stop or back up to speed. */
const PAUSE_EASE_S = 0.7;

/** Tween duration for a dot click. */
const GOTO_DURATION_S = 0.9;

interface CardOrbitOptions {
  /** Total cards sharing the loop. */
  length: number;
}

/**
 * Drives the hero card deck's continuous orbit.
 *
 * `progress` is a single MotionValue sweeping 0 → 1 → 0 forever. Every card
 * reads its own angle off it as `progress + i / length`, so there is no
 * "index" that ever has to jump between slots — just one continuous
 * parameter sampled at a different phase per card. That is what removes the
 * wrap seam the old slot-based deck had to work around with enter/exit
 * animations.
 *
 * A second MotionValue, `speedFactor` (1 = full speed, 0 = stopped), is what
 * actually eases on pause/resume — driven by `animate()` on `EASE_FLUID`
 * rather than snapped, so hover/focus/off-screen pausing visibly decelerates
 * the carousel instead of freezing it mid-turn, and resuming eases back up
 * from wherever it stopped rather than jumping to full speed. A lightweight
 * rAF loop just integrates `progress` by `BASE_SPEED * speedFactor` each
 * frame; it keeps running while the deck is active *or* still coasting down,
 * and stops itself once both are false, so a paused or scrolled-past deck
 * doesn't keep spending frame budget. The `active` effect below restarts it
 * the moment there's speed to chase again.
 */
export function useCardOrbit({ length }: CardOrbitOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const inView = useInView(containerRef, { amount: 0.3 });
  const prefersReduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [nearest, setNearest] = useState(0);

  const progress = useMotionValue(0);
  const speedFactor = useMotionValue(1);

  // The box's measured size. MotionValues rather than a ref because the
  // per-card `x`/`y` transforms read them: a ref would only be picked up on
  // the next `progress` tick, which under reduced motion never comes — the
  // whole static composition would collapse to x=0,y=0. As MotionValues,
  // measuring pushes the cards onto the ellipse immediately, and still
  // without a re-render.
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  const active = inView && !paused && !prefersReduced;
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  /** True while a dot-click tween owns `progress` — the orbit loop yields. */
  const tweeningRef = useRef(false);
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<() => void>(() => {});

  // Measure the box once mounted (and on resize) so per-card transforms can
  // convert the ellipse's percentage radii into pixels without ever putting
  // the size in React state — that would re-render every card on resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      width.set(el.offsetWidth);
      height.set(el.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  // Mount-only: builds the tick function and its `start`, and owns the only
  // `cancelAnimationFrame` that actually tears the loop down. Toggling
  // `active` must never hit this cleanup — the loop has to keep running
  // through a pause so `speedFactor`'s ease-down actually plays out.
  useEffect(() => {
    if (prefersReduced) return;

    const tick = (time: number) => {
      const last = lastRef.current ?? time;
      const dt = time - last;
      lastRef.current = time;

      if (!tweeningRef.current) {
        const speed = BASE_SPEED * speedFactor.get();
        const next = (progress.get() + speed * dt) % 1;
        progress.set(next < 0 ? next + 1 : next);
      }

      if (activeRef.current || speedFactor.get() > 1e-4) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        lastRef.current = null;
      }
    };

    startRef.current = () => {
      if (rafRef.current === null) {
        lastRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (activeRef.current) startRef.current();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  // Ease `speedFactor` toward the new target whenever `active` flips, and
  // make sure the integrator loop is running to consume it.
  useEffect(() => {
    if (prefersReduced) return;
    startRef.current();
    const controls = animate(speedFactor, active ? 1 : 0, {
      duration: PAUSE_EASE_S,
      ease: EASE_FLUID,
    });
    return () => controls.stop();
  }, [active, prefersReduced, speedFactor]);

  useMotionValueEvent(progress, "change", (latest) => {
    const rounded = Math.round(latest * length) % length;
    const index = ((length - rounded) % length + length) % length;
    setNearest((prev) => (prev === index ? prev : index));
  });

  /** Tweens the orbit so card `index` becomes front-most, the shorter way round. */
  const goTo = (index: number) => {
    const target = ((length - (index % length)) % length) / length;
    const current = progress.get();
    const delta = (((target - current + 0.5) % 1) + 1) % 1 - 0.5;

    tweeningRef.current = true;
    animate(progress, current + delta, {
      duration: GOTO_DURATION_S,
      ease: EASE_OUT_EXPO,
      onComplete: () => {
        tweeningRef.current = false;
        startRef.current();
      },
    });
  };

  return {
    containerRef,
    width,
    height,
    progress,
    nearest,
    goTo,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    isStatic: Boolean(prefersReduced),
  };
}
