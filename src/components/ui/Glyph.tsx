import type { GlyphName } from "@/types";

/**
 * Ultra-light line glyphs, drawn inline.
 *
 * Deliberately not an icon library: Lucide/Material stroke weights (2px at
 * 24px) read as heavy and generic at the sizes used here. These are 1px
 * strokes on a 24 grid with round joins, which is what makes them sit next to
 * a serif display face without shouting.
 *
 * They inherit `currentColor`, so a parent's hover/active state animates them
 * for free.
 */

interface GlyphProps {
  name: GlyphName;
  className?: string;
  /** Stroke width on the 24-unit grid. Keep at or below 1.25. */
  weight?: number;
}

const PATHS: Record<GlyphName, React.ReactNode> = {
  spark: (
    <>
      <path d="M12 2.75c0 5.1 1.6 6.7 6.7 6.7-5.1 0-6.7 1.6-6.7 6.7 0-5.1-1.6-6.7-6.7-6.7 5.1 0 6.7-1.6 6.7-6.7Z" />
      <path d="M17.5 15.2c0 2.5.8 3.3 3.3 3.3-2.5 0-3.3.8-3.3 3.3 0-2.5-.8-3.3-3.3-3.3 2.5 0 3.3-.8 3.3-3.3Z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2.75" y="7.25" width="18.5" height="13" rx="2.6" />
      <path d="M8.75 7.25V5.9a2.15 2.15 0 0 1 2.15-2.15h2.2A2.15 2.15 0 0 1 15.25 5.9v1.35" />
      <path d="M2.75 12.6h18.5" />
      <path d="M10.6 12.6h2.8" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M15.9 8.1 13.6 13.6 8.1 15.9l2.3-5.5Z" />
    </>
  ),
  certificate: (
    <>
      <circle cx="12" cy="9" r="5.75" />
      <path d="M8.3 13.6 7.1 21l4.9-2.4 4.9 2.4-1.2-7.4" />
    </>
  ),
  conversation: (
    <>
      <path d="M3 8.1A2.1 2.1 0 0 1 5.1 6h7.6a2.1 2.1 0 0 1 2.1 2.1v3.3a2.1 2.1 0 0 1-2.1 2.1H7.6L3 16.6Z" />
      <path d="M17.9 10.1h1A2.1 2.1 0 0 1 21 12.2v3.2a2.1 2.1 0 0 1-2.1 2.1h-.6L15 20.1v-2.6h-2.4" />
    </>
  ),
  group: (
    <>
      <circle cx="9.2" cy="8.4" r="3.15" />
      <path d="M3.4 19.4c0-3.1 2.6-5.35 5.8-5.35s5.8 2.25 5.8 5.35" />
      <circle cx="17.4" cy="9.6" r="2.25" />
      <path d="M16.6 14.2c2.5.1 4.6 2.2 4.6 4.8" />
    </>
  ),
  chart: (
    <>
      <path d="M3.4 3.6v16.8h17.2" />
      <path d="M6.6 16.4 10.5 11l3.1 2.6 4.4-7" />
      <circle cx="10.5" cy="11" r="1.15" />
      <circle cx="13.6" cy="13.6" r="1.15" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 5.8v5.3c0 4.4-2.85 8.3-7 9.65-4.15-1.35-7-5.25-7-9.65V5.8Z" />
      <path d="m9.1 11.9 2.2 2.2 4.1-4.4" />
    </>
  ),
};

export function Glyph({ name, className, weight = 1 }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/** Trailing arrow for the nested CTA icon well. */
export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.5 16.5 16.5 7.5" />
      <path d="M9.4 7.5h7.1v7.1" />
    </svg>
  );
}

export function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="m5.5 9.25 6.5 6 6.5-6" />
    </svg>
  );
}

export function Star({
  className,
  filled = true,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="m12 3.6 2.62 5.6 5.88.8-4.28 4.32 1.05 6.08L12 17.5l-5.27 2.9 1.05-6.08L3.5 10l5.88-.8Z" />
    </svg>
  );
}
