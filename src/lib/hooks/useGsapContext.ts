"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

// Register once at module scope. GSAP guards against double registration, and
// doing it here means every consumer of this hook gets ScrollTrigger for free.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Scopes a GSAP timeline to a container ref and tears it down completely on
 * unmount.
 *
 * Why `gsap.context`: ScrollTrigger instances are global singletons pinned to
 * the document. Without a scoped context they survive React unmounts (and Fast
 * Refresh), leaving orphaned pin-spacers that push the layout down. `revert()`
 * kills every tween, trigger and inline style the context created.
 *
 * `setup` is intentionally *not* in the dependency array. Callers pass an
 * inline closure, so including it would rebuild every pin on every render;
 * `deps` is the explicit contract for when the timeline should be recreated.
 *
 * @param setup   Runs inside the context. Receives the resolved container.
 * @param deps    Re-creates the context when these change.
 */
export function useGsapContext<T extends HTMLElement = HTMLDivElement>(
  setup: (container: T) => void,
  deps: React.DependencyList = [],
) {
  const scope = useRef<T | null>(null);

  useIsomorphicLayoutEffect(() => {
    const container = scope.current;
    if (!container) return;

    // Honour the OS setting: no pinning, no scrubbing, content renders static.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => setup(container), container);
    return () => ctx.revert();
  }, deps);

  return scope;
}

export { gsap, ScrollTrigger };
