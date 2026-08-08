"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query subscription.
 *
 * `useSyncExternalStore` (rather than useState + useEffect) means the value is
 * read during render on the client and returns the server snapshot during
 * hydration, so there is no flash of the wrong layout and no hydration warning.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

/** Tailwind's `md` breakpoint — the point where asymmetric layouts engage. */
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
