import { cn } from "@/lib/cn";

interface BezelProps {
  children: React.ReactNode;
  className?: string;
  /** Inner core classes — set its own background here. */
  innerClassName?: string;
  /** Larger radius pairing for hero-scale surfaces. */
  size?: "md" | "lg";
  /** Renders the shell on a dark ground (footer, pinned services panel). */
  tone?: "light" | "dark";
  as?: "div" | "article" | "li" | "figure";
}

/**
 * The "double-bezel" enclosure — an outer tray holding an inner plate.
 *
 * Two things earn the extra DOM node:
 *
 * - **Concentric radii.** The core's radius is the shell's minus the padding
 *   (2rem − 0.375rem = 1.625rem), so the two curves stay parallel. Matching
 *   radii on both would make the inset look like a mistake.
 *
 * - **Inset top highlight.** A 1px inner white line on the core simulates light
 *   catching a raised edge. This is what replaces a drop shadow — the card
 *   reads as raised without any dark halo underneath it.
 */
export function Bezel({
  children,
  className,
  innerClassName,
  size = "md",
  tone = "light",
  as: Tag = "div",
}: BezelProps) {
  const radii =
    size === "lg"
      ? { shell: "rounded-bezel-lg p-2", core: "rounded-core-lg" }
      : { shell: "rounded-bezel p-1.5", core: "rounded-core" };

  return (
    <Tag
      className={cn(
        radii.shell,
        tone === "dark"
          ? "bg-on-dark/[0.055] ring-1 ring-on-dark/10"
          : "bg-ink/[0.035] ring-1 ring-ink/[0.06]",
        "ring-inset",
        className,
      )}
    >
      <div
        className={cn(
          radii.core,
          "relative h-full overflow-hidden",
          tone === "dark"
            ? "bg-brand-2 shadow-[inset_0_1px_1px_rgb(255_255_255/0.09)]"
            : "bg-surface shadow-[inset_0_1px_1px_rgb(255_255_255/0.7)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
