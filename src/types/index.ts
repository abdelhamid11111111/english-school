/**
 * Shared domain + UI types for the Lumen English landing page.
 * Every section's content is typed here so `src/data/content.ts` stays the
 * single editable source of copy and the components stay purely presentational.
 */

/** A remote or local image with the alt text required for WCAG AA. */
export interface Media {
  readonly src: string;
  readonly alt: string;
  /** Tiny base64 LQIP so cards never pop in against an empty box. */
  readonly blurDataURL?: string;
}

/* ---------------------------------------------------------------- Hero ---- */

/** One card in the hero's auto-cycling vertical deck. */
export interface HeroCard {
  readonly id: string;
  readonly media: Media;
  /** Course family, e.g. "Conversation". */
  readonly kicker: string;
  readonly title: string;
  /** Short reassurance line, e.g. "6 learners max · Tue & Thu". */
  readonly meta: string;
}

/* ------------------------------------------------------- Adaptation ------- */

/** The four learner personas in the sticky "Built around you" section. */
export interface Persona {
  readonly id: string;
  /** "01" … "04" — rendered as an editorial index. */
  readonly index: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  /** Concrete outcomes shown when the persona is active. */
  readonly outcomes: readonly string[];
  /** Which line-art glyph to render. */
  readonly glyph: GlyphName;
}

/** Ultra-light line glyphs, drawn inline as SVG — no icon-font dependency. */
export type GlyphName =
  | "spark"
  | "briefcase"
  | "compass"
  | "certificate"
  | "conversation"
  | "group"
  | "chart"
  | "shield";

/* ---------------------------------------------------------- Services ------ */

/** One step of the pinned four-step services scroller. */
export interface Service {
  readonly id: string;
  /** "01" … "04". */
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly media: Media;
  /** Three at-a-glance facts rendered over the pinned panel. */
  readonly facts: readonly ServiceFact[];
}

export interface ServiceFact {
  readonly label: string;
  readonly value: string;
}

/* ------------------------------------------------------------ Why Us ------ */

/** An animated counter in the stats band. */
export interface Stat {
  readonly id: string;
  readonly value: number;
  /** Rendered after the counted value, e.g. "+", "%", "k". */
  readonly suffix?: string;
  readonly prefix?: string;
  readonly label: string;
  readonly caption: string;
  /** Decimal places to display; defaults to 0. */
  readonly decimals?: number;
}

export interface ValueProp {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly glyph: GlyphName;
}

/* ------------------------------------------------------ Testimonials ------ */

export interface Testimonial {
  readonly id: string;
  readonly quote: string;
  readonly name: string;
  readonly country: string;
  /** Emoji flag — decorative, hidden from AT since `country` carries meaning. */
  readonly flag: string;
  readonly course: string;
  /** 1–5. */
  readonly rating: number;
  readonly avatar: Media;
}

/* --------------------------------------------------------------- FAQ ------ */

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/* ----------------------------------------------------------- Contact ------ */

export interface ContactChannel {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  /** Rendered as an anchor when present. */
  readonly href?: string;
  readonly glyph: GlyphName;
}

export interface SocialLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

/** Course options in the contact form's interest select. */
export interface CourseOption {
  readonly value: string;
  readonly label: string;
}

/* ------------------------------------------------------------- Forms ------ */

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
}

export type ContactFormErrors = Partial<
  Record<keyof ContactFormValues, string>
>;

export type SubmitState = "idle" | "submitting" | "success" | "error";

/* ---------------------------------------------------------- Nav / misc ---- */

export interface NavLink {
  readonly label: string;
  /** In-page anchor, e.g. "#services". */
  readonly href: string;
}
