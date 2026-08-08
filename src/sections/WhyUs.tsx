"use client";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph } from "@/components/ui/Glyph";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { STATS, VALUE_PROPS } from "@/data/content";
import { useCountUp } from "@/lib/hooks/useCountUp";
import type { Stat } from "@/types";

/**
 * Why Lumen — the breathing room.
 *
 * Deliberately the quietest section on the page: no WebGL, no pinning, no
 * parallax. It sits between two heavily-choreographed sections (the pinned
 * courses scroller above, the marquee below), and the contrast is the point —
 * continuous motion for eight screens straight stops registering as motion.
 *
 * All that moves here is a staggered entrance and four counters.
 */
export function WhyUs() {
  return (
    <section
      id="why"
      className="section-y scroll-mt-24"
      aria-labelledby="why-heading"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Why Lumen</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                id="why-heading"
                className="text-h2 text-balance-tight mt-6 max-w-[15ch]"
              >
                We publish the numbers because we track them.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-lead text-ink-soft mt-6 max-w-[42ch]">
                Most schools sell atmosphere. We would rather show you the four
                measurements that actually predict whether you&apos;ll be
                speaking in six months.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10">
                <MagneticButton href="#contact" variant="outline">
                  Book a free placement
                </MagneticButton>
              </div>
            </Reveal>
          </div>

          <RevealGroup
            as="ul"
            stagger={0.11}
            className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7"
          >
            {VALUE_PROPS.map((prop) => (
              <RevealItem as="li" key={prop.id} className="group">
                <span className="bg-ink/[0.04] ring-ink/[0.06] text-brand grid size-12 place-items-center rounded-full ring-1 ring-inset transition-[background-color,transform] duration-700 ease-fluid group-hover:scale-105 group-hover:bg-accent group-hover:ring-transparent">
                  <Glyph name={prop.glyph} className="size-5" />
                </span>
                <h3 className="font-display text-ink mt-6 text-[1.375rem] tracking-[-0.02em]">
                  {prop.title}
                </h3>
                <p className="text-ink-soft mt-3 max-w-[38ch] text-[0.9375rem] leading-relaxed">
                  {prop.description}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Stats band — one bezel tray holding four plates. */}
        <Reveal className="mt-24" variant="plain">
          <div className="bg-ink/[0.035] ring-ink/[0.06] rounded-bezel-lg p-2 ring-1 ring-inset">
            <dl className="bg-surface rounded-core-lg grid gap-px overflow-hidden shadow-[inset_0_1px_1px_rgb(255_255_255/0.7)] sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat) => (
                <StatCell key={stat.id} stat={stat} />
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function StatCell({ stat }: { stat: Stat }) {
  const { ref, formatted } = useCountUp({
    value: stat.value,
    decimals: stat.decimals ?? 0,
  });

  return (
    <div className="ring-line relative px-8 py-10 ring-1 lg:px-9 lg:py-12">
      <dd className="font-display text-ink flex items-baseline text-[clamp(2.5rem,4.5vw,3.5rem)] leading-none tracking-[-0.035em]">
        {stat.prefix && <span className="text-accent-ink">{stat.prefix}</span>}
        {/* `tabular-nums` stops the box jittering as digit widths change
            during the count — the detail that makes an odometer feel built
            rather than bolted on. */}
        <span ref={ref} className="tabular-nums">
          {formatted}
        </span>
        {stat.suffix && <span className="text-accent-ink">{stat.suffix}</span>}
      </dd>
      <dt className="text-ink mt-5 text-[0.9375rem] font-medium">
        {stat.label}
      </dt>
      <p className="text-ink-soft mt-1.5 text-[0.8125rem] leading-relaxed">
        {stat.caption}
      </p>
    </div>
  );
}
