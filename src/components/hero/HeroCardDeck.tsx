"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "motion/react";
import { Bezel } from "@/components/ui/Bezel";
import { useCardOrbit } from "@/lib/hooks/useCardOrbit";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import type { HeroCard } from "@/types";

/**
 * Orbital hero card deck.
 *
 * ## The mechanic
 *
 * All four cards stay mounted for the deck's entire life and ride one closed
 * circular path: card `i` sits at angle `θ = 2π · (progress + i / length)`,
 * where `progress` is a single MotionValue sweeping 0 → 1 → 0 forever (see
 * `useCardOrbit`). Because every card is just a phase offset of the same
 * parameter, there is no "front slot" a card teleports into and no seam where
 * the loop wraps — unlike a fixed set of stacked slots, a closed curve simply
 * has no end to wrap from.
 *
 * ## The path
 *
 * `θ` maps to a position on the circle: `x = r · sin θ`, `y = r · cos θ`. With
 * screen-down `y`, that puts `θ = 0` at the bottom of the circle, `π/2` at the
 * right, `π` at the top and `3π/2` at the left, and increasing `θ` therefore
 * runs bottom → right → top → left. Only the arc from the top, down the left
 * side, around the bottom and out to the right is ever on screen: a card
 * enters clipped by the top of the hero, descends almost vertically through
 * the left extreme, curves through the bottom, and exits past the right edge.
 *
 * ## Nothing else changes as a card travels
 *
 * Scale, opacity and rotation are all constant. The composition is carried
 * entirely by travel and by the hard clip at the hero's edges — cards leave
 * the frame at full size and full strength rather than shrinking or fading
 * out, which is what keeps every card legible for the whole time it is
 * visible. A scale or opacity ramp reads as a stack of cards breathing in
 * place; a banking rotation reads as cards being flung around a carousel.
 * Neither is what this is.
 *
 * ## Why per-card MotionValues instead of React state
 *
 * Every value below is a `useTransform` chained off the shared `progress`
 * value and applied through `style`, never through props that would trigger
 * a re-render. That is the difference between a 60fps orbit and one that
 * re-renders four card trees every tick — `progress` changes every frame,
 * but the component tree does not.
 */

/**
 * Orbit radius as a fraction of the box, desktop only. Equal on both axes,
 * and the box is square, so the path is a true circle rather than an
 * ellipse — the cards describe an arc of constant curvature instead of
 * accelerating through the narrow ends an ellipse would give them.
 *
 * The ratio that matters is radius-to-card-width: at `0.5 / 0.65 ≈ 0.77` the
 * cards overlap by roughly the amount the reference composition does. Change
 * `r` and the card width in tandem or the spacing between cards along the arc
 * changes with it.
 *
 * Below `lg` the deck doesn't orbit at all — see `MOBILE_STACK` and
 * `HeroOrbitCard`'s mobile branch.
 */
const ORBIT_R = 0.5;

/**
 * Where the circle's centre sits, as a fraction of the box, measured from the
 * box's own centre. `+cx` moves it right, `+cy` moves it down. Desktop only.
 *
 * This is the lever for repositioning the arc without touching layout: the
 * cards are absolutely positioned off `top-1/2 left-1/2`, so shifting the
 * centre slides the whole path and nothing else in the hero moves with it.
 * Raising `cx` pushes the arc right, so cards exit the frame sooner; lowering
 * `cy` lifts it, so more of the bottom of the circle is on screen.
 */
const CENTER = { cx: 0.18, cy: -0.22 };

/**
 * Below `lg` the wide circular orbit doesn't fit: scaled down to a phone's
 * width it either overlaps the card art it's meant to be showcasing or spills
 * past the container's edge and gets clipped by the hero's `overflow-hidden`.
 * Instead the deck becomes a single-axis "peek" carousel — the front card
 * centres itself, its neighbours peek in from either side at a reduced scale,
 * and the card directly opposite fades out, which is what hides the moment it
 * swaps sides.
 *
 * - `spread`: how far a card travels from centre, as a fraction of the box's
 *   width, by the time it's fully faded (see `mobileOpacity` below).
 * - `scaleDrop`: how much smaller a card gets over that same travel.
 * - `lift`: how far a receding card sinks, as a fraction of the box's
 *   height — a small cue that it's dropping behind the front card rather than
 *   sliding past it on the same plane.
 */
const MOBILE_STACK = { spread: 0.42, scaleDrop: 0.22, lift: 0.05 };

/**
 * The angle at which a card is considered to have just entered the visible
 * arc. `θ = π` is the top of the circle; measuring each card's progress from
 * there gives a value that rises monotonically for the whole on-screen
 * journey (top → left → bottom → right), which is exactly the stacking order
 * the composition needs: each card passes in *front* of the one behind it.
 *
 * A depth-style `(1 + cos θ) / 2` cannot do this. It is symmetric about the
 * vertical axis, so the card entering at the left and the card leaving at the
 * right both evaluate to `0.5` and tie — and a z-index tie between two
 * absolutely-positioned siblings resolves by DOM order, which is fixed per
 * card and unrelated to where they are on the path.
 */
const Z_ORIGIN = Math.PI;
const TAU = 2 * Math.PI;

interface HeroCardDeckProps {
  cards: readonly HeroCard[];
  className?: string;
}

export function HeroCardDeck({ cards, className }: HeroCardDeckProps) {
  const { containerRef, width, height, progress, nearest, goTo, pause, resume, isStatic } =
    useCardOrbit({ length: cards.length });

  // Picks which per-card branch below is live: the desktop circular orbit
  // (`ORBIT_R`/`CENTER`) or the mobile peek carousel (`MOBILE_STACK`).
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    // The `lg` gap is large because the front-most card sits at the *bottom*
    // of the circle and overhangs the square box by roughly half its own
    // height. Anything tighter and the card covers the dots.
    <div className={cn("flex flex-col items-center gap-6 lg:gap-[11vw]", className)}>
      <div
        ref={containerRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
        // Fixed aspect box: the cards are absolutely positioned, so without an
        // explicit ratio here the section would collapse and shift on load.
        //
        // `lg:aspect-square`, because equal radii on a square box is what
        // makes the desktop path a circle. Width-driven at every size — at
        // `lg` the width comes from the absolutely-positioned wrapper in
        // `Hero`, so there is no need to cap the height against the viewport:
        // an absolute element can't push the hero past one screen however
        // tall it gets.
        //
        // Below `lg` the deck is the flatter peek carousel (see
        // `MOBILE_STACK`), which only needs enough height for one card plus
        // its scale/lift travel — `aspect-[2/1]` wraps that closely instead
        // of leaving the dead space a square box would under a card cluster
        // that never reaches its edges.
        //
        // On desktop, cards travel well past this box as they orbit, and are
        // meant to. The hero section's `overflow-hidden` is the real clip
        // boundary, chosen over a soft edge mask because a mask would fade
        // cards out mid-travel — the reference composition has them slide off
        // a hard screen edge at full strength.
        className="relative aspect-[2/1] w-full max-w-[34rem] lg:aspect-square lg:max-w-none"
      >
        {cards.map((card, index) => (
          <HeroOrbitCard
            key={card.id}
            card={card}
            index={index}
            length={cards.length}
            progress={progress}
            width={width}
            height={height}
            isDesktop={isDesktop}
            priority={index === 0}
          />
        ))}
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
              aria-selected={i === nearest}
              aria-label={card.title}
              onClick={() => goTo(i)}
              className="group grid h-6 place-items-center px-0.5"
            >
              <span
                className={cn(
                  "block h-[3px] rounded-full transition-all duration-700 ease-fluid",
                  i === nearest
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

interface HeroOrbitCardProps {
  card: HeroCard;
  index: number;
  length: number;
  progress: MotionValue<number>;
  width: MotionValue<number>;
  height: MotionValue<number>;
  isDesktop: boolean;
  /** First-paint priority only — never reassigned as the orbit turns. */
  priority: boolean;
}

function HeroOrbitCard({
  card,
  index,
  length,
  progress,
  width,
  height,
  isDesktop,
  priority,
}: HeroOrbitCardProps) {
  const theta = useTransform(progress, (p) => TAU * (p + index / length));

  // ------------------------------------------------------- desktop orbit ---
  const x = useTransform(
    [theta, width],
    ([t, w]: number[]) => w * (CENTER.cx + ORBIT_R * Math.sin(t)),
  );
  const y = useTransform(
    [theta, height],
    ([t, h]: number[]) => h * (CENTER.cy + ORBIT_R * Math.cos(t)),
  );

  // Distance travelled around the circle since the top, wrapped to one turn.
  // Rises monotonically across the whole visible arc, so the card furthest
  // along is always the front-most one. The reset from max back to 0 happens
  // at the top of the circle, which is above the hero's clip — it is never
  // seen. See `Z_ORIGIN`.
  const desktopZIndex = useTransform(theta, (t) => {
    const swept = (((t - Z_ORIGIN) % TAU) + TAU) % TAU;
    return Math.round((swept / TAU) * 100);
  });

  // No scale, no rotation: a card is the same size and the same orientation
  // at every point on the circle. The only thing that changes is where it is.
  const desktopTransform = useTransform(
    [x, y],
    ([xv, yv]: number[]) => `translate(-50%, -50%) translate(${xv}px, ${yv}px)`,
  );

  // -------------------------------------------------- mobile peek carousel -
  // Signed distance from the front position, in half-turns: 0 at front, ±1
  // at the point directly opposite (mid-swap between sides). Built off the
  // same `theta` the desktop orbit uses, so both branches stay in lockstep
  // with `progress`/`nearest`/`goTo` — only how the number is turned into a
  // position differs.
  const offset = useTransform(theta, (t) => {
    let a = t % TAU;
    if (a > Math.PI) a -= TAU;
    return a / Math.PI;
  });
  const absOffset = useTransform(offset, Math.abs);

  const mobileX = useTransform(
    [offset, width],
    ([o, w]: number[]) => o * MOBILE_STACK.spread * w,
  );
  const mobileY = useTransform(
    [absOffset, height],
    ([a, h]: number[]) => a * MOBILE_STACK.lift * h,
  );
  const mobileScale = useTransform(absOffset, [0, 1], [1, 1 - MOBILE_STACK.scaleDrop]);
  // Stays fully visible while a card is genuinely peeking, then fades out
  // over the last stretch before it's directly behind the front card — that
  // fade is what hides the swap instead of it popping from one side to the
  // other.
  const mobileOpacity = useTransform(absOffset, [0, 0.6, 1], [1, 1, 0]);
  const mobileZIndex = useTransform(absOffset, (a) => Math.round((1 - a) * 100));

  const mobileTransform = useTransform(
    [mobileX, mobileY, mobileScale],
    ([xv, yv, sv]: number[]) =>
      `translate(-50%, -50%) translate(${xv}px, ${yv}px) scale(${sv})`,
  );

  return (
    <motion.div
      style={{
        transform: isDesktop ? desktopTransform : mobileTransform,
        zIndex: isDesktop ? desktopZIndex : mobileZIndex,
        opacity: isDesktop ? 1 : mobileOpacity,
        willChange: "transform",
      }}
      className="absolute top-1/2 left-1/2 aspect-[16/10] w-[62%] lg:w-[65%]"
    >
      <Bezel size="lg" className="h-full">
        <div className="relative h-full">
          <Image
            src={card.media.src}
            alt={card.media.alt}
            fill
            // A card is ~64% of a deck capped at 42rem on desktop, ~58% of one
            // capped at 34rem below that — never request more than that.
            sizes="(min-width: 1024px) 27rem, (min-width: 640px) 20rem, 58vw"
            quality={85}
            placeholder="blur"
            blurDataURL={card.media.blurDataURL}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
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
                {/* {card.kicker} */}
              </p>
              <p className="font-display text-on-dark mt-2 truncate text-[1.375rem] leading-tight tracking-[-0.02em]">
                {/* {card.title} */}
              </p>
              <p className="text-on-dark/72 mt-1.5 text-[0.8125rem]">
                {/* {card.meta} */}
              </p>
            </div>
          </div>
        </div>
      </Bezel>
    </motion.div>
  );
}