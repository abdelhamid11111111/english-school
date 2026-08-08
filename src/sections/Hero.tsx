"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HeroBackdrop } from "@/components/three/HeroBackdrop";
import { HeroCardDeck } from "@/components/hero/HeroCardDeck";
import { SlotText, type SlotPhrase } from "@/components/hero/SlotText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StarRating } from "@/components/ui/StarRating";
import { HERO_CARDS, TESTIMONIALS } from "@/data/content";
import { EASE_FLUID, EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Line 1 is static and reveals word by word through overflow masks.
 * Line 2 is a slot that rolls through `HERO_PHRASES` on a timer.
 */
const HERO_LINE_1 = ["Speak", "English"] as const;

/**
 * Each phrase is authored as two parts of **one line**, not two lines: `lead`
 * (two words) followed immediately by `mark` (one word). Both render in the
 * same muted grey, no highlight — the split exists for layout, not styling.
 *
 * `lead` + `mark` is always **exactly three words total** — see the "Sizing"
 * note in `SlotText`. The slot renders at the h1's full display size on a
 * single line, so a phrase longer than that baseline wraps inside the h1's
 * `max-w-[12ch]` and breaks the roll.
 */
const HERO_PHRASES: readonly SlotPhrase[] = [
  { lead: "like it's", mark: "yours." },
  { lead: "and mean", mark: "it." },
  { lead: "without any", mark: "fear." },
  { lead: "when it", mark: "matters." },
];

/**
 * Hero.
 *
 * Layout archetype: **Editorial Split** — a heavy typographic left column
 * against an interactive right column, on an asymmetric 12-column grid
 * (7 / 5) rather than a symmetric half-and-half. The imbalance is what makes
 * it read as editorial rather than as a marketing template.
 *
 * Entrance choreography runs on `animate` (not `whileInView`) because the
 * hero is above the fold — an IntersectionObserver would fire late enough to
 * be visible as a hitch on a fast connection.
 *
 * The headline reveals word by word through overflow masks. Each word slides
 * up from beneath its own baseline, which reads as type being set rather than
 * as a block fading in.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Foreground moves *slower* than the backdrop's 22% — the depth cue is the
  // difference between the two rates, not the rates themselves.
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const deckY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  const proof = TESTIMONIALS.slice(0, 4);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="hero-fit relative isolate flex min-h-dvh items-center overflow-hidden"
    >
      <HeroBackdrop />

      <div className="shell relative z-10 w-full">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* ---------------------------------------------- left column --- */}
          <motion.div
            style={
              prefersReduced ? undefined : { y: contentY, opacity: contentOpacity }
            }
            className="lg:col-span-7"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }}
            >
              <Eyebrow>Lisboa · Online · Since 2009</Eyebrow>
            </motion.div>

            <h1 className="hero-h1 text-display mt-7 max-w-[12ch]">
              {/* One stable accessible name. Everything below it is decorative
                  and animated, and the slot rewrites itself on a timer — which
                  a screen reader must not be made to follow. */}
              <span className="sr-only">Speak English like it&apos;s yours.</span>

              <span aria-hidden>
                <span className="block">
                  {HERO_LINE_1.map((word, i) => (
                    <span key={word}>
                      {i > 0 && " "}
                      {/* The mask. `pb-[0.12em]` stops descenders being clipped
                          by the overflow box — the tell of a rushed reveal. */}
                      <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                        <motion.span
                          className="text-ink inline-block"
                          initial={{ y: "110%" }}
                          animate={{ y: "0%" }}
                          transition={{
                            duration: 1.05,
                            ease: EASE_OUT_EXPO,
                            delay: 0.28 + i * 0.055,
                          }}
                        >
                          {word}
                        </motion.span>
                      </span>
                    </span>
                  ))}
                </span>

                <SlotText phrases={HERO_PHRASES} />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: EASE_FLUID, delay: 0.75 }}
              className="hero-lead text-lead text-ink-soft mt-8 max-w-[46ch]"
            >
              Not another grammar drill. Small groups of six, tutors who stay
              with you the whole way, and a curriculum rebuilt around the
              conversations you actually need to have — at work, in transit, or
              across a dinner table.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_FLUID, delay: 0.88 }}
              className="hero-cta mt-10 flex flex-wrap items-center gap-3"
            >
              <MagneticButton href="#contact">
                Book a free placement
              </MagneticButton>
              <MagneticButton href="#courses" variant="outline" icon={false}>
                <span className="pr-5">See the courses</span>
              </MagneticButton>
            </motion.div>

            {/* Social proof — small, factual, no badge clutter. */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_FLUID, delay: 1 }}
              className="hero-proof mt-12 flex flex-wrap items-center gap-x-5 gap-y-4"
            >
              <ul className="flex items-center -space-x-3">
                {proof.map((person) => (
                  <li
                    key={person.id}
                    className="ring-bg relative size-10 overflow-hidden rounded-full ring-2"
                  >
                    <Image
                      src={person.avatar.src}
                      alt=""
                      fill
                      sizes="40px"
                      quality={70}
                      placeholder="blur"
                      blurDataURL={person.avatar.blurDataURL}
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
              <div>
                <StarRating rating={5} />
                <p className="text-ink-soft mt-1.5 text-[0.8125rem]">
                  <span className="text-ink font-medium">4.9 / 5</span> from
                  1,180 learner reviews
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* --------------------------------------------- right column --- */}
          {/* Two nested layers on purpose: a `style` MotionValue and an
              `animate` target on the same transform axis fight each other, so
              scroll-parallax lives on the outer node and the load entrance on
              the inner one. */}
          <motion.div
            style={prefersReduced ? undefined : { y: deckY }}
            className="lg:col-span-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 56, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.25, ease: EASE_OUT_EXPO, delay: 0.45 }}
            >
              <HeroCardDeck cards={HERO_CARDS} className="mx-auto" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
