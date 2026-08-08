"use client";

import { useCallback } from "react";
import {
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

interface MagneticOptions {
  /** How far the element travels toward the cursor, as a fraction of offset. */
  strength?: number;
  /** Extra travel applied to a nested child (icon), for internal tension. */
  childStrength?: number;
}

interface MagneticApi {
  x: MotionValue<number>;
  y: MotionValue<number>;
  childX: MotionValue<number>;
  childY: MotionValue<number>;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

/**
 * Magnetic-hover physics for buttons.
 *
 * The raw pointer offset drives a spring rather than the transform directly —
 * that's what gives the element apparent mass, and it means the return-to-rest
 * animation is free (setting the value to 0 lets the spring settle it).
 *
 * The nested icon gets a *larger* strength than the shell, so the two layers
 * separate slightly under the cursor. That parallax between shell and icon is
 * the whole effect; without it a magnetic button just looks like it wobbles.
 *
 * Pointer events (not mouse) so this is inert on touch, where there is no
 * hover state to speak of.
 */
export function useMagnetic({
  strength = 0.35,
  childStrength = 0.6,
}: MagneticOptions = {}): MagneticApi {
  const prefersReduced = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawChildX = useMotionValue(0);
  const rawChildY = useMotionValue(0);

  const spring = { stiffness: 260, damping: 22, mass: 0.6 };
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);
  const childX = useSpring(rawChildX, spring);
  const childY = useSpring(rawChildY, spring);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (prefersReduced || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      // Offset from the element's centre, in px.
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      rawX.set(dx * strength);
      rawY.set(dy * strength);
      rawChildX.set(dx * (childStrength - strength));
      rawChildY.set(dy * (childStrength - strength));
    },
    [prefersReduced, rawChildX, rawChildY, rawX, rawY, strength, childStrength],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    rawChildX.set(0);
    rawChildY.set(0);
  }, [rawChildX, rawChildY, rawX, rawY]);

  return { x, y, childX, childY, onPointerMove, onPointerLeave };
}
