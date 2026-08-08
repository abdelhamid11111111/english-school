import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` warns during SSR. GSAP setup must run before paint to avoid
 * a flash of un-positioned content, so we use the layout effect in the browser
 * and fall back to `useEffect` on the server where it never runs anyway.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
