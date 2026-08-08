"use client";

import { motion, type Variants } from "motion/react";
import { fadeUp, fadeUpPlain, IN_VIEW, staggerParent } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to hold before the entrance runs. */
  delay?: number;
  /** `plain` skips the blur dissolve — use on large images. */
  variant?: "blur" | "plain";
  as?: "div" | "section" | "li" | "article" | "header" | "p" | "span";
}

/**
 * Scroll entrance wrapper.
 *
 * Uses Motion's `whileInView` (IntersectionObserver under the hood) rather
 * than a scroll listener — a `scroll` handler firing per frame across a dozen
 * sections is the single easiest way to lose mobile framerate.
 *
 * `once: true` means an element resolves exactly one time; re-animating on
 * every pass makes long pages feel restless.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "blur",
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as];
  const variants: Variants = variant === "blur" ? fadeUp : fadeUpPlain;

  return (
    <MotionTag
      className={cn("will-animate", className)}
      initial="hidden"
      whileInView="visible"
      viewport={IN_VIEW}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  as?: "div" | "ul" | "ol" | "section";
}

/** Parent that cascades `RevealItem` children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delayChildren = 0,
  as = "div",
}: RevealGroupProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={IN_VIEW}
      variants={staggerParent(stagger, delayChildren)}
    >
      {children}
    </MotionTag>
  );
}

/** Child of `RevealGroup`. Inherits the parent's stagger timing. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "p";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag className={cn("will-animate", className)} variants={fadeUp}>
      {children}
    </MotionTag>
  );
}
