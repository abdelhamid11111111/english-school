import type { Transition, Variants } from "motion/react";

/**
 * Shared motion language.
 *
 * Every curve here is a custom cubic-bezier — no `linear`, no `ease-in-out`.
 * `EASE_FLUID` is the house curve: a long, heavily-damped tail that reads as
 * physical mass rather than a CSS default.
 */
export const EASE_FLUID = [0.32, 0.72, 0, 1] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Baseline transition for entrance choreography. */
export const ENTER_TRANSITION: Transition = {
  duration: 0.9,
  ease: EASE_FLUID,
};

/**
 * The house entrance: a heavy fade-up with a blur dissolve. The blur is what
 * separates this from a stock fade — it reads as the element resolving into
 * focus rather than sliding in.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: ENTER_TRANSITION,
  },
};

/** Same, without the blur — for large images where blur() is expensive. */
export const fadeUpPlain: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: ENTER_TRANSITION },
};

/** Parent that staggers its children through `fadeUp`. */
export function staggerParent(stagger = 0.09, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/**
 * Shared `whileInView` config. `amount: 0.25` fires once a quarter of the
 * element is visible — early enough to feel responsive, late enough that the
 * animation isn't already over by the time it's on screen.
 */
export const IN_VIEW = {
  once: true,
  amount: 0.25,
} as const;

/** Word-level mask reveal used on the hero headline. */
export const maskWord: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 1.05, ease: EASE_OUT_EXPO },
  },
};
