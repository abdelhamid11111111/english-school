"use client";

import { Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useIsDesktop } from "@/lib/hooks/useMediaQuery";

/**
 * `ssr: false` is legal here because this file is a Client Component. Calling
 * it from a Server Component would throw in Next 16. Three.js therefore lands
 * in its own async chunk, fetched only after hydration on capable viewports.
 */
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  // No spinner: the CSS aurora underneath is the loading state, so the canvas
  // fades in over an already-composed background instead of over a hole.
  loading: () => null,
});

/**
 * Layered hero background.
 *
 * Three depth planes, each moving at a different rate as the hero scrolls past
 * — that difference *is* the parallax:
 *
 *   plane 0  aurora gradient wash   → 8%  of scroll distance
 *   plane 1  WebGL solids/particles → 22%
 *   plane 2  vignette + hairline    → static, anchors the foreground
 *
 * All three translate on `y` only, driven by a single `useScroll` progress
 * value, so the browser composites transforms without a layout pass.
 *
 * The WebGL plane is skipped entirely below 768px and under
 * `prefers-reduced-motion`; the aurora alone carries the composition there.
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isDesktop = useIsDesktop();
  const prefersReduced = useReducedMotion();
  // `amount: 0` + margin: the loop stops as soon as the hero is fully gone.
  const inView = useInView(ref, { amount: 0.05 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const auroraY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const render3D = isDesktop && !prefersReduced;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Plane 0 — aurora wash. Pure radial gradients, no filter: blurring a
          layer this large would repaint on every composite. */}
      <motion.div
        style={{ y: prefersReduced ? 0 : auroraY }}
        className="absolute inset-x-[-20%] top-[-30%] bottom-[-20%]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              // Lime carries the wash; the ink haze only adds depth behind it.
              // Capped at 30% — a full-strength field here would fight the
              // headline sitting directly on top of it.
              "radial-gradient(48rem 38rem at 78% 18%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 68%)",
              "radial-gradient(42rem 34rem at 12% 62%, color-mix(in srgb, var(--ink) 7%, transparent), transparent 66%)",
              "radial-gradient(34rem 28rem at 55% 96%, color-mix(in srgb, var(--sand) 90%, transparent), transparent 70%)",
            ].join(","),
          }}
        />
      </motion.div>

      {/* Plane 1 — WebGL. */}
      {render3D && (
        <motion.div
          style={{ y: sceneY, opacity: sceneOpacity }}
          className="absolute inset-0"
        >
          <Suspense fallback={null}>
            <HeroScene active={inView} />
          </Suspense>
        </motion.div>
      )}

      {/* Plane 2 — vignette into the page ground, so the hero dissolves into
          the next section rather than ending on a hard edge. */}
      <div className="from-bg via-bg/0 absolute inset-x-0 bottom-0 h-56 bg-linear-to-t to-transparent" />
    </div>
  );
}
