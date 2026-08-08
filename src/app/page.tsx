import { Grain } from "@/components/ui/Grain";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import { Adaptation } from "@/sections/Adaptation";
import { Contact } from "@/sections/Contact";
import { Faq } from "@/sections/Faq";
import { Hero } from "@/sections/Hero";
import { Services } from "@/sections/Services";
import { Testimonials } from "@/sections/Testimonials";
import { WhyUs } from "@/sections/WhyUs";
import { BRAND, FAQS } from "@/data/content";

/**
 * The page itself is a Server Component: only the sections that need browser
 * APIs carry `"use client"`, so the shell, fonts, metadata and JSON-LD are all
 * server-rendered and the client bundle stays scoped to the animated parts.
 *
 * Section order is a deliberate motion arc:
 *   hero (3D + parallax) → sticky reveal → pinned scroller → *quiet* →
 *   marquee → accordion → form
 * "Why Lumen" is the rest beat. Without it the pinned section and the marquee
 * collide and the whole middle of the page reads as noise.
 */

/** FAQPage structured data — makes the accordion eligible for rich results. */
function FaqJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Content is authored, not user input; no injection surface here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

function SchoolJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LanguageSchool",
    name: BRAND.name,
    slogan: BRAND.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua das Flores 118",
      postalCode: "1200-195",
      addressLocality: "Lisboa",
      addressCountry: "PT",
    },
    telephone: "+351210994420",
    email: "hello@lumen-english.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1180",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function Home() {
  return (
    <>
      {/* Skip link — first thing in the tab order, hidden until focused. */}
      <a
        href="#main"
        className="bg-brand text-on-dark focus-visible:ring-accent sr-only rounded-full px-5 py-3 text-sm focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50"
      >
        Skip to content
      </a>

      <Grain />
      <SiteNav />

      <main id="main" className="flex-1">
        <Hero />
        <Adaptation />
        <Services />
        <WhyUs />
        <Testimonials />
        <Faq />
        <Contact />
      </main>

      <SiteFooter />

      <FaqJsonLd />
      <SchoolJsonLd />
    </>
  );
}
