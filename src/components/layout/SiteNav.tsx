"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { BRAND, NAV_LINKS } from "@/data/content";
import { EASE_FLUID, EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Floating island navigation.
 *
 * - Detached from the top edge (`top-4`) as a glass pill rather than a
 *   full-bleed sticky bar. `backdrop-blur` is safe here because the element is
 *   fixed — blurring a *scrolling* container repaints the GPU layer every frame.
 *
 * - The hamburger genuinely morphs: two bars translate to a shared centre and
 *   counter-rotate into an X. Nothing is swapped out or faded.
 *
 * - Menu links reveal through an overflow-hidden mask, sliding up from below
 *   their own baseline on a stagger. Combined with a scaling accent rule, that
 *   reads as typography being set rather than a list appearing.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const { scrollY } = useScroll();

  // Condense once the hero headline has cleared. Reading through a motion
  // value keeps this off the React render path until the boolean actually flips.
  useMotionValueEvent(scrollY, "change", (value) => {
    setCondensed(value > 80);
  });

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Lock the page behind the overlay and wire Escape.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const goTo = useCallback(
    (href: string) => {
      setOpen(false);
      // Deferred so the overlay's exit doesn't compete with the scroll, and so
      // body overflow is restored before we measure.
      requestAnimationFrame(() => {
        document
          .querySelector(href)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [],
  );

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
        <motion.nav
          aria-label="Primary"
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.35 }}
          className={cn(
            "pointer-events-auto relative flex w-full max-w-3xl items-center gap-2 rounded-full",
            "bg-surface/72 supports-[backdrop-filter]:bg-surface/55 backdrop-blur-2xl",
            "ring-1 ring-ink/[0.07] ring-inset",
            // The CTA used to set the desktop height (44px well + 2×6px padding).
            // It's gone, so pin the island to that measurement explicitly —
            // otherwise the nav collapses to the link text on md and up. Mobile
            // is still sized by the 44px toggle and needs no floor.
            "p-1.5 pl-5 md:min-h-[4.25rem] transition-[box-shadow,background-color] duration-700 ease-fluid",
            condensed && "shadow-ambient",
          )}
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-ink mr-auto font-display text-[1.0625rem] tracking-[-0.02em] whitespace-nowrap"
          >
            {BRAND.short}
            <span className="text-accent-strong">.</span>
          </a>

          {/* Centred on the pill itself, not on the space left over beside the
              wordmark — so it stays optically centred regardless of brand width. */}
          <ul className="hidden items-center gap-1 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                  }}
                  className="text-ink-soft hover:text-ink relative rounded-full px-3.5 py-2 text-[0.875rem] whitespace-nowrap transition-colors duration-500 ease-fluid"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile toggle — morphing hamburger. */}
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="bg-ink/[0.05] relative grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-500 ease-fluid md:hidden"
          >
            <span className="relative block h-3 w-[18px]">
              <span
                className={cn(
                  "bg-ink absolute left-0 h-px w-full origin-center transition-all duration-500 ease-fluid",
                  open ? "top-1/2 rotate-45" : "top-0 rotate-0",
                )}
              />
              <span
                className={cn(
                  "bg-ink absolute left-0 h-px w-full origin-center transition-all duration-500 ease-fluid",
                  open ? "top-1/2 -rotate-45" : "top-full rotate-0",
                )}
              />
            </span>
          </button>
        </motion.nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_FLUID }}
            className="bg-bg/85 fixed inset-0 z-[39] backdrop-blur-3xl md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="flex h-full flex-col justify-center px-8 pb-24"
            >
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <li key={link.href} className="overflow-hidden py-1">
                    <motion.a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        goTo(link.href);
                      }}
                      initial={{ y: "115%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "115%", opacity: 0 }}
                      transition={{
                        duration: 0.75,
                        ease: EASE_OUT_EXPO,
                        delay: 0.08 + i * 0.06,
                      }}
                      className="text-ink font-display block text-[clamp(2.25rem,11vw,3.25rem)] leading-[1.08] tracking-[-0.03em]"
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>

              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.36 }}
                className="mt-12"
              >
                <MagneticButton
                  onClick={() => goTo("#contact")}
                  variant="solid"
                >
                  Book a placement
                </MagneticButton>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
