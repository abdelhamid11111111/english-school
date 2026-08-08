"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "./Glyph";
import { useMagnetic } from "@/lib/hooks/useMagnetic";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "onDark";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  /** Hide the nested arrow well (e.g. for a submit button with a spinner). */
  icon?: React.ReactNode | false;
}

// The lime carries dark text (14.4:1), which is the only way a high-chroma
// accent survives contrast requirements at button size.
const SHELL: Record<Variant, string> = {
  solid: "bg-accent text-ink",
  outline: "bg-transparent text-ink ring-1 ring-inset ring-ink/15",
  onDark: "bg-accent text-ink",
};

const WELL: Record<Variant, string> = {
  solid: "bg-ink/12 text-ink",
  outline: "bg-ink/6 text-ink",
  onDark: "bg-ink/12 text-ink",
};

/**
 * The house CTA.
 *
 * Three things make it feel physical rather than styled:
 *
 * 1. **Magnetic pull** — the shell springs toward the cursor (see
 *    `useMagnetic`), and the nested icon well pulls *harder*. That differential
 *    creates internal parallax; without it the button just slides.
 *
 * 2. **Button-in-button** — the arrow lives inside its own circular well flush
 *    with the shell's right padding, never naked beside the label.
 *
 * 3. **Press compression** — `active:scale-[0.98]` on a fluid curve simulates
 *    the surface taking load.
 *
 * A `<span>` sweep sits behind the label and wipes across on hover, clipped by
 * the pill. It animates `transform` only, so it never triggers layout.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "solid",
  disabled,
  className,
  icon,
}: MagneticButtonProps) {
  const { x, y, childX, childY, onPointerMove, onPointerLeave } = useMagnetic();

  const shell = cn(
    "group relative inline-flex items-center gap-3 overflow-hidden rounded-full",
    "py-1.5 pl-7 pr-1.5 text-[0.9375rem] font-medium tracking-[-0.01em]",
    "transition-[transform,box-shadow] duration-500 ease-fluid",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
    SHELL[variant],
    className,
  );

  const inner = (
    <>
      {/* Hover sweep — scales in from the left edge behind the content. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 rounded-full bg-current opacity-[0.09] transition-transform duration-700 ease-fluid group-hover:scale-x-100"
      />
      <span className="relative z-10">{children}</span>
      {icon !== false && (
        <motion.span
          style={{ x: childX, y: childY }}
          aria-hidden
          className={cn(
            "relative z-10 grid size-11 shrink-0 place-items-center rounded-full",
            "transition-[transform,background-color] duration-500 ease-fluid",
            "group-hover:scale-105",
            WELL[variant],
          )}
        >
          {icon ?? (
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-fluid group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" />
          )}
        </motion.span>
      )}
    </>
  );

  return (
    <motion.span
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="inline-block"
    >
      {href ? (
        <Link href={href} className={shell} onClick={onClick}>
          {inner}
        </Link>
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={shell}
        >
          {inner}
        </button>
      )}
    </motion.span>
  );
}
