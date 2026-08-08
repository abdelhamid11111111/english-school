/**
 * Minimal class-name joiner. `clsx`/`tailwind-merge` would be dead weight here:
 * this build never conditionally overrides the same Tailwind utility twice, so
 * conflict resolution isn't needed.
 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
