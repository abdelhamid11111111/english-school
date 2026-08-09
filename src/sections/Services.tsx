"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/data/content";
import { useGsapContext, gsap } from "@/lib/hooks/useGsapContext";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useTilt } from "@/lib/hooks/useTilt";
import { EASE_FLUID, EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Courses — GSAP-pinned four-step scroller.
 *
 * ## Why GSAP here and `position: sticky` in the section above
 *
 * This section needs the viewport *held* while an internal timeline advances,
 * and it must release only once all four steps are consumed. `sticky` can hold
 * an element but gives no progress value and no control over release; that's
 * exactly what `ScrollTrigger` with `pin` + `scrub` provides.
 *
 * The pin runs for `100vh × 4`, so each course owns a full viewport of scroll.
 * `pinSpacing` (default) injects a spacer of that height, which is what makes
 * the following section start only after step 04.
 *
 * ## Keeping 60fps
 *
 * `onUpdate` fires on every scroll frame. Setting React state there would
 * re-render the tree ~60×/s, so it does two different things:
 *
 * - the **step index** goes through `setState`, but only when it actually
 *   changes (four times across the whole section);
 * - the **progress bars and image parallax** are written straight to the DOM
 *   via refs, touching only `transform`. No React, no layout.
 *
 * ## Fitting one viewport
 *
 * A pinned frame taller than the viewport is unreachable: the pin holds the
 * top of the frame at the top of the screen, so anything past 100vh can never
 * be scrolled to. At `lg` the frame is therefore locked to exactly `h-dvh`
 * and its contents are sized in `vh` by the `.courses-fit` rules in
 * `globals.css`, which compress the heading, the four steps and the panel
 * together as the window gets shorter.
 *
 * ## Mobile
 *
 * Pinning on touch is unreliable (address-bar resize re-triggers refresh) and
 * a pinned section fights momentum scrolling. Below `lg` the trigger is never
 * created and the courses render as a plain stacked list — `isDesktop` is a
 * dependency of the GSAP context, so crossing the breakpoint tears the pin
 * down and rebuilds cleanly.
 *
 * The query is `lg` and not the shared `useIsDesktop` (`md`): the two-column
 * layout below only exists from `lg`, so pinning at `md` would pin the tall
 * stacked layout and cut its bottom half off.
 */
export function Services() {
  const [step, setStep] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const pinRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  // Mirrors `step` for use inside the scroll handler without re-subscribing.
  const stepRef = useRef(0);

  const scopeRef = useGsapContext<HTMLElement>(
    (container) => {
      if (!isDesktop || !pinRef.current) return;

      const count = SERVICES.length;

      // Everything is driven off a scrubbed proxy tween rather than off
      // `self.progress` in a bare `ScrollTrigger.create`. A numeric `scrub`
      // smooths the *tween*; the trigger's own `progress` is always the raw
      // scroll position, so reading it would step with every wheel notch and
      // throw the smoothing away.
      const proxy = { progress: 0 };

      gsap.to(proxy, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          // Recomputed on refresh (resize, font load) rather than captured once.
          end: () => `+=${window.innerHeight * count}`,
          pin: pinRef.current,
          anticipatePin: 1,
          // Seconds the scrub takes to catch up. Wheel and trackpad deltas
          // arrive as discrete jumps; the eased tail is what turns them into
          // continuous motion through the four steps.
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          // `progress` is 0–1 across the whole pin; carve it into `count`
          // equal bands. The clamp keeps index in range at exactly 1.0.
          const raw = proxy.progress * count;
          const index = Math.min(count - 1, Math.floor(raw));
          const sub = Math.min(1, raw - index);

          if (index !== stepRef.current) {
            stepRef.current = index;
            setStep(index);
          }

          // Direct DOM writes — transform only, so these never cost a layout.
          barRefs.current.forEach((bar, i) => {
            if (!bar) return;
            const fill = i < index ? 1 : i === index ? sub : 0;
            bar.style.transform = `scaleX(${fill})`;
          });

          // Panel imagery drifts against the pinned frame. This is the
          // parallax layer: the frame is stationary, the photo inside is not.
          if (parallaxRef.current) {
            parallaxRef.current.style.transform = `translate3d(0, ${
              (sub - 0.5) * -28
            }px, 0) scale(1.08)`;
          }
        },
      });
    },
    [isDesktop],
  );

  const active = SERVICES[step];

  return (
    <section
      id="courses"
      ref={scopeRef}
      className="bg-brand mt-16 text-on-dark relative scroll-mt-24"
      aria-labelledby="courses-heading"
    >
      <div ref={pinRef} className="relative overflow-hidden">
        {/* Ambient wash behind everything — the deepest parallax plane. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(46rem 34rem at 82% 16%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 65%), radial-gradient(38rem 30rem at 8% 88%, color-mix(in srgb, var(--brand-2) 90%, transparent), transparent 68%)",
          }}
        />

        {/* `lg:h-dvh` — not `min-h`: while pinned, anything past the viewport
            is unreachable, so the frame is locked to the screen and
            `.courses-fit` shrinks the contents to match. */}
        <div className="shell courses-fit relative flex min-h-dvh flex-col justify-center py-24 lg:h-dvh lg:py-0">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            {/* ------------------------------------------- step list --- */}
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow tone="dark">Four ways in</Eyebrow>
              </Reveal>
              <Reveal delay={0.08}>
                <h2
                  id="courses-heading"
                  className="courses-h2 text-h2 text-on-dark text-balance-tight mt-6 max-w-[16ch]"
                >
                  Pick the shape that fits your week.
                </h2>
              </Reveal>

              <ol className="courses-list mt-12 flex flex-col">
                {SERVICES.map((service, i) => {
                  const isActive = i === step;
                  return (
                    <li key={service.id}>
                      <button
                        type="button"
                        // Clicking a step is the keyboard/pointer escape hatch
                        // from a scroll-only interaction.
                        onClick={() => {
                          stepRef.current = i;
                          setStep(i);
                        }}
                        aria-current={isActive ? "step" : undefined}
                        className="courses-step group w-full py-5 text-left"
                      >
                        <span className="flex items-baseline gap-5">
                          <span
                            className={cn(
                              "font-display text-[0.9375rem] tabular-nums transition-colors duration-700 ease-fluid",
                              isActive ? "text-accent" : "text-on-dark/35",
                            )}
                          >
                            {service.index}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "courses-step-title font-display block text-[1.5rem] leading-tight tracking-[-0.02em] transition-colors duration-700 ease-fluid lg:text-[1.75rem]",
                                isActive
                                  ? "text-on-dark"
                                  : "text-on-dark/45 group-hover:text-on-dark/75",
                              )}
                            >
                              {service.title}
                            </span>
                            <motion.span
                              className="text-on-dark-soft block overflow-hidden text-[0.9375rem]"
                              initial={false}
                              animate={{
                                height: isActive ? "auto" : 0,
                                opacity: isActive ? 1 : 0,
                                marginTop: isActive ? 8 : 0,
                              }}
                              transition={{ duration: 0.6, ease: EASE_FLUID }}
                            >
                              {service.summary}
                            </motion.span>
                          </span>
                        </span>

                        {/* Progress rail — filled directly by ScrollTrigger. */}
                        <span className="courses-rail bg-on-dark/12 mt-5 block h-px w-full overflow-hidden">
                          <span
                            ref={(el) => {
                              barRefs.current[i] = el;
                            }}
                            className="bg-accent block h-full w-full origin-left"
                            style={{
                              transform: `scaleX(${
                                isDesktop ? 0 : isActive ? 1 : 0
                              })`,
                            }}
                          />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="courses-cta mt-10 hidden lg:block">
                <MagneticButton href="#contact" variant="onDark">
                  Talk to an advisor
                </MagneticButton>
              </div>
            </div>

            {/* ----------------------------------------- pinned panel --- */}
            <div className="lg:col-span-7">
              <ServicePanel
                key="panel"
                index={step}
                parallaxRef={parallaxRef}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copy for the active course sits below the fold of the pinned frame on
          small screens, where the panel is a simple stack. */}
      <div className="shell relative pb-24 lg:hidden">
        <p className="text-on-dark-soft text-lead max-w-[46ch]">
          {active.description}
        </p>
        <div className="mt-8">
          <MagneticButton href="#contact" variant="onDark">
            Talk to an advisor
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

interface ServicePanelProps {
  index: number;
  parallaxRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * The pinned visual. Only the *contents* swap between steps — the bezel frame
 * itself never remounts, so the panel reads as one physical object showing
 * different material rather than as four cards being replaced.
 */
function ServicePanel({ index, parallaxRef }: ServicePanelProps) {
  const service = SERVICES[index];
  const tilt = useTilt({ max: 6 });

  return (
    <motion.div
      style={tilt.style}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className="bg-on-dark/[0.055] ring-on-dark/10 rounded-bezel-lg p-2 ring-1 ring-inset"
    >
      <div className="rounded-core-lg bg-brand-2 relative overflow-hidden shadow-[inset_0_1px_1px_rgb(255_255_255/0.09)]">
        {/* Aspect-driven below `lg`, height-driven above: inside the pin the
            panel gets whatever vertical room is left, not whatever 16/11 of
            the column width happens to be. */}
        <div className="courses-panel relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto">
          {/* Parallax carrier — ScrollTrigger writes its transform. Scaled
              past 1 so the drift never exposes an edge. */}
          <div
            ref={parallaxRef}
            className="absolute inset-0 will-animate"
            style={{ transform: "scale(1.08)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                className="absolute inset-0"
              >
                <Image
                  src={service.media.src}
                  alt={service.media.alt}
                  fill
                  sizes="(min-width: 1024px) 56vw, 92vw"
                  quality={85}
                  placeholder="blur"
                  blurDataURL={service.media.blurDataURL}
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            aria-hidden
            className="from-brand/90 via-brand/25 absolute inset-0 bg-linear-to-t to-transparent"
          />

          {/* Floating fact chips — pushed forward in Z so the tilt separates
              them from the photo behind. */}
          <div
            className="courses-panel-pad absolute inset-x-0 bottom-0 p-6 lg:p-8"
            style={{ transform: "translateZ(38px)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55, ease: EASE_FLUID }}
              >
                <p className="text-on-dark-soft hidden max-w-[44ch] text-[0.9375rem] leading-relaxed lg:block">
                  {service.description}
                </p>
                <ul className="courses-panel-facts mt-6 flex flex-wrap gap-2">
                  {service.facts.map((fact) => (
                    <li
                      key={fact.label}
                      className="bg-brand/55 ring-on-dark/12 rounded-full px-4 py-2 ring-1 ring-inset"
                    >
                      <span className="text-on-dark-soft text-[0.6875rem] tracking-[0.14em] uppercase">
                        {fact.label}
                      </span>
                      <span className="text-on-dark ml-2 text-[0.8125rem] font-medium">
                        {fact.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
