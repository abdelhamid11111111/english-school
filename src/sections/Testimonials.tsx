"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Bezel } from "@/components/ui/Bezel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRating } from "@/components/ui/StarRating";
import { TESTIMONIALS } from "@/data/content";
import { useMarquee } from "@/lib/hooks/useMarquee";
import type { Testimonial } from "@/types";

/** Must match the flex `gap` below, in px — the hook uses it to wrap exactly. */
const GAP = 24;

/**
 * Learner stories — continuous horizontal marquee.
 *
 * The list is rendered twice; the second copy is `aria-hidden` so assistive
 * tech reads six testimonials, not twelve. The whole strip is wrapped in a
 * `role="region"` with a label, and each card is a real `<figure>/<blockquote>`
 * so the quotes remain semantic even though they're moving.
 *
 * Hover pauses via an eased speed multiplier rather than a hard stop — see
 * `useMarquee` for why that isn't a CSS animation.
 */
export function Testimonials() {
  const { x, copyRef, pause, resume, isStatic } = useMarquee<HTMLUListElement>({
    speed: 40,
    gap: GAP,
  });

  return (
    <section
      id="stories"
      className="section-y bg-sand scroll-mt-24 overflow-hidden"
      aria-labelledby="stories-heading"
    >
      <div className="shell">
        <SectionHeading
          eyebrow="Learner stories"
          title={<span id="stories-heading">People who stopped translating in their head.</span>}
          lead="Six of the eleven hundred reviews we've collected since 2009. We don't edit them for length or for grammar."
          align="center"
        />
      </div>

      <div
        className="relative mt-16"
        role="region"
        aria-label="Learner testimonials"
        onMouseEnter={pause}
        onMouseLeave={resume}
        // Keyboard users tabbing into a card get the same courtesy pause.
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        {/* Edge masks — the strip fades into the section ground instead of
            being clipped by a hard edge. Gradients, not filters. */}
        <div
          aria-hidden
          className="from-sand pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r to-transparent md:w-32"
        />
        <div
          aria-hidden
          className="from-sand pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l to-transparent md:w-32"
        />

        {isStatic ? (
          // Reduced motion: a normal, user-driven horizontal scroller.
          <ul
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 md:px-10"
            style={{ scrollbarWidth: "thin" }}
          >
            {TESTIMONIALS.map((t) => (
              <li key={t.id} className="snap-start">
                <TestimonialCard testimonial={t} />
              </li>
            ))}
          </ul>
        ) : (
          <motion.div style={{ x }} className="flex w-max gap-6 will-animate">
            <ul ref={copyRef} className="flex shrink-0 gap-6">
              {TESTIMONIALS.map((t) => (
                <li key={t.id}>
                  <TestimonialCard testimonial={t} />
                </li>
              ))}
            </ul>
            {/* Duplicate copy — visual only. */}
            <ul aria-hidden className="flex shrink-0 gap-6">
              {TESTIMONIALS.map((t) => (
                <li key={`${t.id}-clone`}>
                  <TestimonialCard testimonial={t} clone />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function TestimonialCard({
  testimonial,
  clone = false,
}: {
  testimonial: Testimonial;
  clone?: boolean;
}) {
  return (
    <Bezel
      as="figure"
      className="group h-full w-[19rem] transition-transform duration-700 ease-fluid hover:-translate-y-1 sm:w-[23rem]"
    >
      <div className="flex h-full flex-col p-7">
        <StarRating rating={testimonial.rating} />

        <blockquote className="text-ink mt-5 flex-1 text-[1.0625rem] leading-[1.6] tracking-[-0.01em]">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        <figcaption className="border-line mt-7 flex items-center gap-3.5 border-t pt-6">
          <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
            <Image
              src={testimonial.avatar.src}
              alt=""
              fill
              sizes="44px"
              quality={70}
              placeholder="blur"
              blurDataURL={testimonial.avatar.blurDataURL}
              // The cloned copy is decorative; never let it compete for
              // bandwidth with the real one.
              loading="lazy"
              className="object-cover"
            />
          </span>
          <span className="min-w-0">
            <span className="text-ink block text-[0.9375rem] font-medium">
              {testimonial.name}
              {clone && <span className="sr-only"> (duplicate)</span>}
            </span>
            <span className="text-ink-soft mt-0.5 block text-[0.8125rem]">
              <span aria-hidden>{testimonial.flag}</span>{" "}
              {testimonial.country} · {testimonial.course}
            </span>
          </span>
        </figcaption>
      </div>
    </Bezel>
  );
}
