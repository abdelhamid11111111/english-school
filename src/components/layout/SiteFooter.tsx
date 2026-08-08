import { BRAND, NAV_LINKS, SOCIALS } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Dark closing band. Its job is to end the page on the brand's ground colour
 * so the scroll doesn't just stop on cream — the tonal shift signals "done".
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand text-on-dark relative overflow-hidden">
      {/* Oversized wordmark, cropped by the section. Purely typographic
          texture — it sits under the content at very low contrast. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-14%] left-1/2 w-full -translate-x-1/2 text-center select-none"
      >
        <span className="font-display text-on-dark/[0.045] text-[clamp(6rem,22vw,18rem)] leading-none tracking-[-0.05em]">
          {BRAND.name}
        </span>
      </div>

      <div className="shell relative py-20 md:py-28">
        <Reveal className="border-on-dark/10 flex flex-col gap-12 border-b pb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[22ch]">
            <p className="font-display text-h3">
              Still deciding? Come and sit in on a class.
            </p>
            <p className="text-on-dark-soft mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed">
              Free, no commitment, any level. Most people book after the first
              forty minutes.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-on-dark-soft hover:text-on-dark group inline-flex items-center gap-2 text-[0.9375rem] transition-colors duration-500 ease-fluid"
                  >
                    <span
                      aria-hidden
                      className="bg-accent h-px w-0 transition-[width] duration-500 ease-fluid group-hover:w-4"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <div className="text-on-dark-soft mt-10 flex flex-col gap-6 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.name}. Lisboa, Portugal.
          </p>
          <ul className="flex flex-wrap items-center gap-6">
            {SOCIALS.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-on-dark relative transition-colors duration-500 ease-fluid"
                >
                  {social.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
