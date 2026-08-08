import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  /** Narrower measure for centred headings. */
  leadClassName?: string;
}

/** Eyebrow → display heading → lead paragraph, on a shared cascade. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "left",
  className,
  leadClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <Reveal>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "text-h2 text-balance-tight max-w-[18ch]",
            align === "center" && "mx-auto max-w-[22ch]",
            tone === "dark" ? "text-on-dark" : "text-ink",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              "text-lead max-w-[46ch]",
              align === "center" && "mx-auto",
              tone === "dark" ? "text-on-dark-soft" : "text-ink-soft",
              leadClassName,
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
