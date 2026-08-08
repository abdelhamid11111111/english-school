/**
 * Film-grain overlay.
 *
 * Fixed and `pointer-events-none`, per the performance rule: a noise texture
 * attached to a scrolling container forces a repaint of the whole layer on
 * every frame. Pinned to the viewport it composites once and is then free.
 *
 * The turbulence is an inline data-URI, so it costs no request and no bytes
 * beyond the markup.
 */
const NOISE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="140" height="140" filter="url(#n)" opacity="0.55"/></svg>`,
)}`;

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage: `url("${NOISE}")`,
        backgroundSize: "140px 140px",
      }}
    />
  );
}
