"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Bezel } from "@/components/ui/Bezel";
import { useCardCycle } from "@/lib/hooks/useCardCycle";
import { EASE_FLUID } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { HeroCard } from "@/types";

/**
 * Auto-cycling vertical card deck.
 *
 * ## The mechanic
 *
 * Three slots are rendered at a time out of a four-card loop. Slot 0 is the
 * hero card; slots 1 and 2 sit progressively lower, smaller and dimmer, so the
 * stack reads as receding into depth. On each tick every card moves up one
 * slot.
 *
 * ## Why AnimatePresence rather than modular arithmetic on a fixed set
 *
 * The obvious implementation — keep all four cards mounted and compute
 * `slot = (i - active) % 4` — has one fatal frame: the card leaving the front
 * must travel from slot 0 to slot 3, i.e. *downward past everything else*,
 * while every other card moves up. That is the visible jump-cut the brief
 * rules out.
 *
 * Instead the front card unmounts and plays an exit that continues its upward
 * travel off the top, while a fresh card mounts below the stack and rises in.
 * Every element only ever moves in one direction, so the loop has no seam.
 *
 * ## Timing
 *
 * Transition duration (1.05s) is deliberately much shorter than the dwell
 * (3.4s). Overlapping them would read as constant drift rather than as a deck
 * settling between beats.
 */

/** Layout per visible slot: y offset (px), scale, opacity, stacking order. */
const SLOTS = [
  { y: 0, scale: 1, opacity: 1, z: 30 },
  { y: 34, scale: 0.945, opacity: 0.78, z: 20 },
  { y: 62, scale: 0.895, opacity: 0.45, z: 10 },
] as const;

const VISIBLE = SLOTS.length;

interface HeroCardDeckProps {
  cards: readonly HeroCard[];
  className?: string;
}

export function HeroCardDeck({ cards, className }: HeroCardDeckProps) {
  const { containerRef, stack, active, goTo, pause, resume, isStatic } =
    useCardCycle(cards, {
      length: cards.length,
      visible: VISIBLE,
      intervalMs: 3400,
    });

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div
        ref={containerRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
        // Fixed aspect box: the cards are absolutely positioned, so without an
        // explicit ratio here the section would collapse and shift on load.
        //
        // Below `lg` the box is width-driven (fill the column, height follows
        // the ratio). At `lg` it flips to height-driven and is capped against
        // the viewport, so the deck can never be what pushes the hero past one
        // screen on a short laptop. `w-auto` lets the ratio derive the width.
        className="relative aspect-[4/5] w-full max-w-[26rem] lg:h-[min(30rem,54dvh)] lg:w-auto lg:max-w-none"
      >
        {/* `initial={false}` suppresses the enter animation on first paint —
            the deck's own entrance is choreographed by the Hero instead. */}
        <AnimatePresence initial={false}>
          {stack.map(({ item, slot }) => {
            const layout = SLOTS[slot];
            return (
              <motion.div
                key={item.id}
                // Enter: from below the stack, small and transparent.
                initial={{
                  y: SLOTS[VISIBLE - 1].y + 34,
                  scale: SLOTS[VISIBLE - 1].scale - 0.04,
                  opacity: 0,
                }}
                animate={{
                  y: layout.y,
                  scale: layout.scale,
                  opacity: layout.opacity,
                }}
                // Exit: continues upward and dissolves. Slightly larger, as if
                // lifting toward the viewer on its way out.
                exit={{ y: -72, scale: 1.03, opacity: 0 }}
                transition={{ duration: 1.05, ease: EASE_FLUID }}
                style={{ zIndex: layout.z }}
                className="absolute inset-0 will-animate"
              >
                <Bezel size="lg" className="h-full">
                  <div className="relative h-full">
                    <Image
                      src={item.media.src}
                      alt={item.media.alt}
                      fill
                      // The deck occupies roughly half the viewport on desktop
                      // and is capped at 26rem, so never request more.
                      sizes="(min-width: 1024px) 26rem, (min-width: 640px) 60vw, 90vw"
                      quality={85}
                      placeholder="blur"
                      blurDataURL={item.media.blurDataURL}
                      // Only the front card is worth an eager fetch; the rest
                      // lazy-load as the deck reaches them.
                      loading={slot === 0 ? "eager" : "lazy"}
                      fetchPriority={slot === 0 ? "high" : "auto"}
                      className="object-cover"
                    />

                    {/* Scrim, so the caption keeps AA contrast over any photo. */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-[#0a0b0a]/85 via-[#0a0b0a]/35 to-transparent"
                    />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                      <div className="min-w-0">
                        <p className="text-micro text-on-dark/70 font-medium uppercase">
                          {item.kicker}
                        </p>
                        <p className="font-display text-on-dark mt-2 truncate text-[1.375rem] leading-tight tracking-[-0.02em]">
                          {item.title}
                        </p>
                        <p className="text-on-dark/72 mt-1.5 text-[0.8125rem]">
                          {item.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                </Bezel>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress dots double as manual controls, so the deck is operable by
          keyboard and not purely time-based. */}
      {!isStatic && (
        <div
          role="tablist"
          aria-label="Featured courses"
          className="flex items-center gap-2"
        >
          {cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={card.title}
              onClick={() => goTo(i)}
              className="group grid h-6 place-items-center px-0.5"
            >
              <span
                className={cn(
                  "block h-[3px] rounded-full transition-all duration-700 ease-fluid",
                  i === active
                    ? "bg-ink w-8"
                    : "bg-ink/20 group-hover:bg-ink/35 w-3",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
