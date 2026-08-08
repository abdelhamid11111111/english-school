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
 * Orbit radius as a fraction of the box. Equal on both axes, and the box is
 * square, so the path is a true circle rather than an ellipse — the cards
 * describe an arc of constant curvature instead of accelerating through the
 * narrow ends an ellipse would give them.
 *
 * The ratio that matters is radius-to-card-width: at `0.5 / 0.65 ≈ 0.77` the
 * cards overlap by roughly the amount the reference composition does. Change
 * `r` and the card width in tandem or the spacing between cards along the arc
 * changes with it.
 *
 * Mobile tightens the radius because there the deck sits in the flow beneath
 * the CTAs, where a circle this wide would swing up into the copy above it.
 */
const ORBIT = {
  desktop: { r: 0.5 },
  mobile: { r: 0.34 },
} as const;

/**
 * Where the circle's centre sits, as a fraction of the box, measured from the
 * box's own centre. `+cx` moves it right, `+cy` moves it down.
 *
 * This is the lever for repositioning the arc without touching layout: the
 * cards are absolutely positioned off `top-1/2 left-1/2`, so shifting the
 * centre slides the whole path and nothing else in the hero moves with it.
 * Raising `cx` pushes the arc right, so cards exit the frame sooner; lowering
 * `cy` lifts it, so more of the bottom of the circle is on screen.
 *
 * Kept separate per breakpoint for the same reason `ORBIT` is — the deck is
 * anchored differently above and below `lg`.
 */
const CENTER = {
  desktop: { cx: 0.18, cy: -0.22 },
  mobile: { cx: 0.1, cy: -0.1 },
} as const;

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

  // Selects the orbit radius: the two breakpoints place the deck differently,
  // so they need different circles. See `ORBIT`.
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
        // Square, because equal radii on a square box is what makes the path a
        // circle. Width-driven at every size — at `lg` the width comes from the
        // absolutely-positioned wrapper in `Hero`, so there is no need to cap
        // the height against the viewport: an absolute element can't push the
        // hero past one screen however tall it gets.
        //
        // Cards travel well past this box as they orbit, and are meant to. The
        // hero section's `overflow-hidden` is the real clip boundary, chosen
        // over a soft edge mask because a mask would fade cards out mid-travel
        // — the reference composition has them slide off a hard screen edge at
        // full strength.
        className="relative aspect-square w-full max-w-[34rem] lg:max-w-none"
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

  const { r } = isDesktop ? ORBIT.desktop : ORBIT.mobile;
  const { cx, cy } = isDesktop ? CENTER.desktop : CENTER.mobile;

  const x = useTransform([theta, width], ([t, w]: number[]) => w * (cx + r * Math.sin(t)));
  const y = useTransform([theta, height], ([t, h]: number[]) => h * (cy + r * Math.cos(t)));

  // Distance travelled around the circle since the top, wrapped to one turn.
  // Rises monotonically across the whole visible arc, so the card furthest
  // along is always the front-most one. The reset from max back to 0 happens
  // at the top of the circle, which is above the hero's clip — it is never
  // seen. See `Z_ORIGIN`.
  const zIndex = useTransform(theta, (t) => {
    const swept = (((t - Z_ORIGIN) % TAU) + TAU) % TAU;
    return Math.round((swept / TAU) * 100);
  });

  // No scale, no rotation: a card is the same size and the same orientation
  // at every point on the circle. The only thing that changes is where it is.
  const transform = useTransform(
    [x, y],
    ([xv, yv]: number[]) => `translate(-50%, -50%) translate(${xv}px, ${yv}px)`,
  );

  return (
    <motion.div
      style={{
        transform,
        zIndex,
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