"use client";

import { useCallback } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

interface TiltOptions {
  /** Maximum rotation in degrees at the element's corners. */
  max?: number;
  /** CSS perspective, in px. Lower = stronger foreshortening. */
  perspective?: number;
}

export interface TiltApi {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** Bind to the element that should receive the 3D transform. */
  style: {
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
    transformPerspective: number;
    transformStyle: "preserve-3d";
  };
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

/**
 * Pointer-driven 3D tilt for a panel or card.
 *
 * Normalised pointer position (−0.5 … 0.5) feeds two springs, then maps to
 * rotation. Springing the *input* rather than the output means the plate keeps
 * turning briefly after the cursor stops — the inertia that separates this
 * from a linear `rotate(mouseX)`.
 *
 * `max` stays small by default (7°): past roughly 10° the perspective
 * distortion on a photo becomes obvious and the effect reads as a gimmick.
 */
export function useTilt({ max = 7, perspective = 1100 }: TiltOptions = {}): TiltApi {
  const prefersReduced = useReducedMotion();

  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 180, damping: 20, mass: 0.5 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  // Y-pointer drives rotateX (and is inverted): moving the cursor up should
  // tip the top edge away from the viewer.
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (prefersReduced || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      px.set((event.clientX - rect.left) / rect.width - 0.5);
      py.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [prefersReduced, px, py],
  );

  const onPointerLeave = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  return {
    rotateX,
    rotateY,
    style: {
      rotateX,
      rotateY,
      transformPerspective: perspective,
      transformStyle: "preserve-3d",
    },
    onPointerMove,
    onPointerLeave,
  };
}
