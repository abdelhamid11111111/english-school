/**
 * Dependency-free LQIP generator.
 *
 * `next/image` with `placeholder="blur"` needs a `blurDataURL`. Rather than
 * shipping real base64 JPEGs (or pulling in `plaiceholder` + a build step), we
 * emit a 4×4 SVG of the photo's dominant tone. Next.js blurs it up, so the
 * card reserves its box and fades from a matching colour instead of flashing
 * white — which is what actually causes perceived layout shift here.
 *
 * Swap for real base64 LQIPs when brand photography replaces the stock set.
 */
export function toneBlur(hex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="${hex}"/></svg>`;
  // btoa is unavailable in the Node build pass; Buffer is unavailable in the
  // browser bundle. This runs at module scope in both, so handle both.
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(svg).toString("base64")
      : window.btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

/** Builds a size-capped, auto-format Unsplash URL. */
export function unsplash(id: string, width = 1200): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}
