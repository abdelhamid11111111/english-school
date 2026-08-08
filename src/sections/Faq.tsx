"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "@/components/ui/Glyph";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQS } from "@/data/content";
import { EASE_FLUID } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { FaqItem } from "@/types";

/**
 * FAQ accordion.
 *
 * `height: auto` is animatable in Motion (it measures the target and
 * interpolates), which is what makes this smooth without hard-coding panel
 * heights. Opacity is deliberately given a *shorter* duration than height and
 * no delay on the way out — text that fades before the panel finishes closing
 * hides the reflow that happens as lines re-wrap at the end of the collapse.
 *
 * Accessibility: real `<button>` with `aria-expanded` and `aria-controls`,
 * panel labelled back by the trigger, and `hidden` handled by unmounting so
 * collapsed answers stay out of the tab order.
 */
export function Faq() {
  // Single-open accordion. `null` = all closed, which is the honest default —
  // pre-opening the first item just to look full is a dark pattern in miniature.
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="faq"
      className="section-y scroll-mt-24"
      aria-labelledby="faq-heading"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Questions"
              title={<span id="faq-heading">The things people ask before they sign up.</span>}
              lead="If yours isn't here, ask us directly — we answer within one working day."
            />
            <Reveal delay={0.24}>
              <div className="mt-10 hidden lg:block">
                <MagneticButton href="#contact" variant="outline">
                  Ask a question
                </MagneticButton>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <ul className="border-line border-t">
              {FAQS.map((item, i) => (
                <Reveal as="li" key={item.id} delay={i * 0.05}>
                  <FaqRow
                    item={item}
                    isOpen={openId === item.id}
                    onToggle={() =>
                      setOpenId((current) =>
                        current === item.id ? null : item.id,
                      )
                    }
                  />
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function FaqRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-line group border-b">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-start gap-6 py-7 text-left"
        >
          <span
            className={cn(
              "font-display flex-1 text-[1.125rem] tracking-[-0.015em] transition-colors duration-700 ease-fluid md:text-[1.3125rem]",
              isOpen ? "text-ink" : "text-ink group-hover:text-accent-ink",
            )}
          >
            {item.question}
          </span>

          {/* The chevron rotates rather than swapping to a minus — one
              continuous rotation reads as the same object changing state. */}
          <span
            className={cn(
              "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full transition-[background-color,transform] duration-700 ease-fluid",
              isOpen
                ? "bg-brand text-on-dark rotate-180"
                : "bg-ink/[0.05] text-ink-soft group-hover:bg-ink/10",
            )}
          >
            <ChevronDown className="size-4" />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.55, ease: EASE_FLUID },
                opacity: { duration: 0.4, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.45, ease: EASE_FLUID },
                opacity: { duration: 0.2 },
              },
            }}
            // Clipping is required for a height animation; without it the
            // content spills past the collapsing box on the way out.
            className="overflow-hidden"
          >
            <p className="text-ink-soft max-w-[62ch] pb-8 text-[0.9375rem] leading-[1.7]">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
