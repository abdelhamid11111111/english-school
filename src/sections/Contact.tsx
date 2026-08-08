"use client";

import { AnimatePresence, motion } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Glyph } from "@/components/ui/Glyph";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT_CHANNELS, COURSE_OPTIONS, SOCIALS } from "@/data/content";
import { useContactForm } from "@/lib/hooks/useContactForm";
import { EASE_FLUID, EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Contact — info column against the enquiry form.
 *
 * The form is a real `<form>` with a native submit, so it degrades to a normal
 * POST if JS fails. Validation lives in `useContactForm`; this component only
 * renders state.
 *
 * The success view replaces the fields in place rather than showing a toast —
 * a toast can be missed, and the empty form left behind reads as "nothing
 * happened".
 */
export function Contact() {
  const { values, status, setField, blurField, submit, reset, errorFor } =
    useContactForm();

  const submitting = status === "submitting";

  return (
    <section
      id="contact"
      className="section-y scroll-mt-24"
      aria-labelledby="contact-heading"
    >
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* --------------------------------------------- info column --- */}
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow>Get started</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                id="contact-heading"
                className="text-h2 text-balance-tight mt-6 max-w-[14ch]"
              >
                Book a placement. It takes twenty minutes.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-lead text-ink-soft mt-6 max-w-[42ch]">
                A short written task and a real conversation with a tutor — no
                multiple choice, no obligation. You&apos;ll leave knowing your
                CEFR level and exactly which track fits.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <ul className="mt-12 flex flex-col gap-1">
                {CONTACT_CHANNELS.map((channel) => {
                  const body = (
                    <>
                      <span className="bg-ink/[0.04] ring-ink/[0.06] text-brand grid size-11 shrink-0 place-items-center rounded-full ring-1 ring-inset transition-[background-color,transform] duration-700 ease-fluid group-hover:scale-105 group-hover:bg-accent group-hover:ring-transparent">
                        <Glyph name={channel.glyph} className="size-[18px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-micro text-ink-soft block font-medium uppercase">
                          {channel.label}
                        </span>
                        <span className="text-ink mt-1.5 block text-[0.9375rem] leading-snug">
                          {channel.value}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={channel.id}>
                      {channel.href ? (
                        <a
                          href={channel.href}
                          target={
                            channel.href.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            channel.href.startsWith("http")
                              ? "noreferrer noopener"
                              : undefined
                          }
                          className="group -mx-3 flex items-start gap-4 rounded-2xl px-3 py-3.5 transition-colors duration-500 ease-fluid hover:bg-[color-mix(in_srgb,var(--ink)_3%,transparent)]"
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="group -mx-3 flex items-start gap-4 px-3 py-3.5">
                          {body}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="border-line mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-8">
                <span className="text-micro text-ink-soft font-medium uppercase">
                  Follow
                </span>
                {SOCIALS.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-ink-soft hover:text-ink group inline-flex items-center gap-2 text-[0.9375rem] transition-colors duration-500 ease-fluid"
                  >
                    <span
                      aria-hidden
                      className="bg-ink h-px w-0 transition-[width] duration-500 ease-fluid group-hover:w-4"
                    />
                    {social.label}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* --------------------------------------------- form column --- */}
          <Reveal delay={0.1} variant="plain" className="lg:col-span-7">
            <div className="bg-ink/[0.035] ring-ink/[0.06] rounded-bezel-lg p-2 ring-1 ring-inset">
              <div className="bg-surface rounded-core-lg relative overflow-hidden p-7 shadow-[inset_0_1px_1px_rgb(255_255_255/0.7)] md:p-10">
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                      className="flex min-h-[26rem] flex-col items-start justify-center"
                    >
                      <span className="bg-brand text-on-dark grid size-14 place-items-center rounded-full">
                        <Glyph name="certificate" className="size-6" />
                      </span>
                      <h3 className="font-display text-h3 text-ink mt-7 max-w-[16ch]">
                        Booked. Check your inbox.
                      </h3>
                      <p className="text-ink-soft mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed">
                        We&apos;ve sent three placement slots for this week. Pick
                        whichever suits — or reply and we&apos;ll find another.
                      </p>
                      <button
                        type="button"
                        onClick={reset}
                        className="text-accent-ink mt-8 text-[0.9375rem] underline decoration-1 underline-offset-4 transition-opacity duration-500 ease-fluid hover:opacity-70"
                      >
                        Send another enquiry
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={submit}
                      noValidate
                      initial={false}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.4, ease: EASE_FLUID }}
                      className="flex flex-col gap-7"
                    >
                      <div className="grid gap-7 sm:grid-cols-2">
                        <InputField
                          label="Full name"
                          name="name"
                          value={values.name}
                          error={errorFor("name")}
                          required
                          autoComplete="name"
                          onChange={(v) => setField("name", v)}
                          onBlur={() => blurField("name")}
                        />
                        <InputField
                          label="Email"
                          name="email"
                          type="email"
                          value={values.email}
                          error={errorFor("email")}
                          required
                          autoComplete="email"
                          onChange={(v) => setField("email", v)}
                          onBlur={() => blurField("email")}
                        />
                        <InputField
                          label="Phone (optional)"
                          name="phone"
                          type="tel"
                          value={values.phone}
                          error={errorFor("phone")}
                          autoComplete="tel"
                          onChange={(v) => setField("phone", v)}
                          onBlur={() => blurField("phone")}
                        />
                        <SelectField
                          label="Course interest"
                          name="course"
                          value={values.course}
                          error={errorFor("course")}
                          required
                          options={COURSE_OPTIONS}
                          onChange={(v) => setField("course", v)}
                          onBlur={() => blurField("course")}
                        />
                      </div>

                      <TextareaField
                        label="What are you hoping to do in English?"
                        name="message"
                        rows={4}
                        value={values.message}
                        error={errorFor("message")}
                        required
                        onChange={(v) => setField("message", v)}
                        onBlur={() => blurField("message")}
                      />

                      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
                        <MagneticButton
                          type="submit"
                          disabled={submitting}
                          icon={submitting ? <Spinner /> : undefined}
                        >
                          {submitting ? "Sending…" : "Request a placement"}
                        </MagneticButton>
                        <p className="text-ink-soft max-w-[26ch] text-[0.8125rem] leading-relaxed">
                          No card, no commitment. We reply within one working
                          day.
                        </p>
                      </div>

                      {/* Live region so a failed submit is announced, not just
                          shown. `aria-live` on a persistent node — inserting a
                          new live region often isn't announced at all. */}
                      <div aria-live="polite" className="sr-only">
                        {status === "error"
                          ? "The form has errors. Please review the highlighted fields."
                          : ""}
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Inline spinner sized for the CTA's icon well. */
function Spinner() {
  return (
    <motion.span
      aria-hidden
      className="border-current/30 block size-4 rounded-full border-2 border-t-current"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    />
  );
}
