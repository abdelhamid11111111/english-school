# Lumen English — landing page

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Motion · GSAP ScrollTrigger · React Three Fiber

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npx tsc --noEmit
```

---

## Dependencies

| Package | Version | Used for |
| --- | --- | --- |
| `next` / `react` / `react-dom` | 16.3.0 / 19.2.8 | framework |
| `motion` | ^13 | Framer Motion, current package name. Imported as `motion/react` |
| `gsap` | ^3.15 | ScrollTrigger pinning (Courses section only) |
| `three` + `@react-three/fiber` | ^0.185 / ^9.7 | hero 3D field |
| `tailwindcss` + `@tailwindcss/postcss` | ^4 | styling, CSS-first config |
| `@types/three` | ^0.185 | dev |

`@react-three/drei` is deliberately **not** installed. Its `Environment` helper
fetches an HDR from a CDN at runtime, and the two helpers this build would have
used (`Float`, a tilt rig) are ~30 lines of `useFrame`.

---

## Structure

```
src/
  app/          layout (fonts, metadata, viewport) · page · globals.css (tokens)
  components/
    ui/         Bezel · MagneticButton · Field · Reveal · Glyph · Eyebrow ·
                SectionHeading · StarRating · Grain
    layout/     SiteNav · SiteFooter
    hero/       HeroCardDeck
    three/      HeroBackdrop (lazy boundary) · HeroScene (the Canvas)
  sections/     Hero · Adaptation · Services · WhyUs · Testimonials · Faq · Contact
  lib/
    hooks/      useCardCycle · useMarquee · useGsapContext · useTilt ·
                useMagnetic · useCountUp · useContactForm · useMediaQuery
    cn.ts · motion.ts (shared easings/variants) · blur.ts (LQIP + Unsplash URLs)
  data/         content.ts — all copy, typed
  types/        index.ts
```

`page.tsx` is a **Server Component**; only sections needing browser APIs carry
`"use client"`. Content lives entirely in `data/content.ts`, so components stay
presentational and rewording never touches a component.

---

## Design system

### Palette

Near-white paper, near-black ink, one electric lime accent. Three palettes ship;
swap by changing `data-palette` on `<html>` in `app/layout.tsx`.

| Token | `lime` (default) | `midnight` | `coral` |
| --- | --- | --- | --- |
| `--bg` | `#fbfbfa` | `#f5f1e8` | `#f3f2ef` |
| `--ink` | `#101211` | `#101d2c` | `#17171a` |
| `--brand` (dark bands) | `#101211` | `#0e2038` | `#16161a` |
| `--accent` | `#bef264` | `#d9ad4a` | `#ff6a4d` |

**The accent rule.** Lime on white is ~1.2:1. On light grounds it is therefore
only ever used as a *fill behind dark text* — CTAs, chips, the `.mark-accent`
highlight. Thin indicators (progress rails, focus underlines, dots) use `--ink`.
Two companion tokens cover the rest: `--accent-ink` (8.4:1, accent-coloured
text) and `--accent-strong` (3.8:1, non-text UI). Form validation uses a
separate `--danger`, never the accent.

Every foreground/background pair in use was measured; all meet WCAG AA (4.5:1
text, 3:1 UI). Lowest passing pair is `--ink-soft` on `--bg` at 6.1:1.

### Type

**Inter**, one variable family across display and body. Hierarchy comes from
weight and tracking, not a second face — which is why the clamp-based scale in
`globals.css` tightens letter-spacing as size grows (`-0.042em` at display,
`-0.014em` at lead). Headings are 600, not 700: Inter's bold closes the counters
at display size.

---

## Section mechanics

Ordering is a motion arc — **hero (3D + parallax) → sticky reveal → pinned
scroller → *quiet* → marquee → accordion → form**. "Why Lumen" is the rest beat;
without it the pinned section and the marquee collide.

**Hero deck** (`useCardCycle`) — three slots from a four-card loop. Rather than
`slot = (i - active) % 4`, which forces the exiting card to travel *downward*
past everything else, the front card unmounts through an `AnimatePresence` exit
that continues its upward travel while a fresh card mounts below. Every element
moves one direction, so the loop has no seam. Chained `setTimeout`, not
`setInterval` — the latter queues catch-up ticks when the tab is throttled.

**Adaptation** — `position: sticky`, not GSAP. The panel only needs to stay put,
and sticky does that on the compositor with no pin-spacer. Active persona is
decided by a ~10% band across the viewport middle (`margin: -45% 0 -45% 0`),
which is stable in both scroll directions.

**Services** — GSAP `ScrollTrigger` with `pin` + `scrub`, held for `100vh × 4`
so the section releases only after step 04. `onUpdate` fires per frame, so it
splits work: the step index goes through `setState` (4 times total), while
progress bars and image parallax are written straight to the DOM via refs,
touching `transform` only. Pinning is skipped below `lg`; `isDesktop` is a
dependency of the GSAP context, so crossing the breakpoint rebuilds cleanly.

**Testimonials** — the list renders twice; `x` decreases continuously and the
wrap distance (measured live via `ResizeObserver`) is *added back* rather than
reset, so no frame shows a jump. Hover eases a speed multiplier to 0 — a CSS
keyframe can loop but can't be decelerated mid-flight.

**3D** — `HeroBackdrop` is the lazy boundary (`next/dynamic`, `ssr: false`,
legal because that file is a Client Component). Three planes move at different
rates: aurora 8%, WebGL 22%, vignette static. `dpr` clamped to 1.5, no shadow
maps, shared geometries, seeded PRNG for the particle field, and `frameloop`
flips to `"never"` when the hero leaves the viewport. Skipped entirely below
768px and under `prefers-reduced-motion`.

**Reduced motion** is honoured in three places, not one: the CSS media query,
`useReducedMotion` in the Motion hooks, and an early return in
`useGsapContext` so pins are never created at all.

---

## Wiring it up

- **Form** — `useContactForm` is a stub; replace the `setTimeout` in `submit()`
  with a POST to a Route Handler or a Server Action. Nothing else changes.
- **Images** — currently Unsplash, allow-listed in `next.config.ts`
  (`remotePatterns`, plus the `qualities` allow-list Next 16 now requires). Swap
  `src/data/content.ts` for brand photography and replace `toneBlur()` LQIPs
  with real base64 placeholders.
- **Metadata** — `SITE_URL` in `app/layout.tsx`, plus the address/telephone in
  the `LanguageSchool` JSON-LD in `app/page.tsx`.
- Next 16 note: `priority` on `next/image` is deprecated — this build uses
  `loading` / `fetchPriority`.
# english-school
