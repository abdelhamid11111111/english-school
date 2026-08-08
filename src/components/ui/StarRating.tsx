import { Star } from "./Glyph";
import { cn } from "@/lib/cn";

interface StarRatingProps {
  /** 1–5. */
  rating: number;
  className?: string;
}

/**
 * The stars are decorative; the rating is announced once via the wrapper's
 * label so a screen reader hears "Rated 5 out of 5" instead of five glyphs.
 */
export function StarRating({ rating, className }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div
      className={cn("text-rating flex items-center gap-1", className)}
      role="img"
      aria-label={`Rated ${clamped} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-3.5" filled={i < clamped} />
      ))}
    </div>
  );
}
