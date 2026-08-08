import { cn } from "@/lib/cn";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
}

/**
 * Microscopic pill badge that precedes every major heading. It does the work
 * a coloured subheading usually does, without competing with the display face.
 */
export function Eyebrow({ children, className, tone = "light" }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        "text-micro font-medium uppercase",
        tone === "dark"
          ? "bg-on-dark/8 text-on-dark-soft ring-1 ring-on-dark/10 ring-inset"
          : "bg-ink/[0.04] text-ink-soft ring-1 ring-ink/[0.06] ring-inset",
        className,
      )}
    >
      {/* Lime is invisible on the light ground at this size, so the dot uses
          the darkened accent there and the pure lime on dark. */}
      <span
        aria-hidden
        className={cn(
          "size-1 rounded-full",
          tone === "dark" ? "bg-accent" : "bg-accent-strong",
        )}
      />
      {children}
    </span>
  );
}
