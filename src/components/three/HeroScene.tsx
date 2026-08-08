"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Hero 3D field — floating soft-matte solids over an orbiting particle cloud.
 *
 * Deliberate constraints, all of them performance decisions:
 *
 * - **No drei.** Everything here is plain R3F + three. `drei`'s `Environment`
 *   fetches an HDR from a CDN at runtime, and its helpers pull a lot of
 *   surface area into the bundle for two effects we can write in 30 lines.
 *
 * - **No shadow maps, no post-processing, no transmission.** Depth comes from
 *   three coloured lights and material roughness. A shadow map here would
 *   double the draw calls for something largely invisible against cream.
 *
 * - **Geometry and materials are memoised and shared.** One sphere geometry is
 *   reused across instances; three.js disposes GPU buffers per-geometry, not
 *   per-mesh, so sharing keeps VRAM flat.
 *
 * - **dpr is clamped to 1.5.** Above that the fill cost on a 3-retina-screen
 *   canvas of this size dominates the frame with no perceptible gain.
 *
 * The whole module is behind `next/dynamic({ ssr: false })` — see
 * `LazyHeroScene` — so three.js (~600kB raw) never enters the initial bundle
 * and never runs during prerender, where `window` and WebGL don't exist.
 */

/**
 * Palette sampled from the "lime" tokens.
 *
 * The three foreground bodies are lime; the torus and the far sphere stay in
 * off-white so the field still has tonal range and the lime reads as a colour
 * rather than as the only colour.
 */
const SOLIDS = [
  { color: "#bef264", position: [-2.6, 0.9, -1.2], scale: 0.92, kind: "ico" },
  { color: "#d7dad4", position: [2.5, -0.6, -0.4], scale: 0.66, kind: "sphere" },
  { color: "#eceee9", position: [1.5, 1.7, -2.6], scale: 1.15, kind: "torus" },
  { color: "#bef264", position: [-1.9, -1.6, -2.1], scale: 0.5, kind: "sphere" },
  { color: "#bef264", position: [3.3, 1.4, -3.2], scale: 0.42, kind: "ico" },
] as const;

type SolidKind = (typeof SOLIDS)[number]["kind"];

interface SolidProps {
  color: string;
  position: readonly [number, number, number];
  scale: number;
  kind: SolidKind;
  /** Phase offset so the five bodies never bob in unison. */
  phase: number;
  geometries: Record<SolidKind, THREE.BufferGeometry>;
}

function Solid({
  color,
  position,
  scale,
  kind,
  phase,
  geometries,
}: SolidProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    // Two out-of-phase sines give an orbit that never visibly repeats on the
    // timescale a visitor spends in the hero.
    mesh.position.y = position[1] + Math.sin(t * 0.42 + phase) * 0.28;
    mesh.position.x = position[0] + Math.cos(t * 0.27 + phase) * 0.16;
    mesh.rotation.x = t * 0.12 + phase;
    mesh.rotation.y = t * 0.17 + phase;
  });

  return (
    <mesh
      ref={ref}
      position={position as unknown as THREE.Vector3Tuple}
      scale={scale}
      geometry={geometries[kind]}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.62}
        metalness={0.08}
        flatShading={kind === "ico"}
      />
    </mesh>
  );
}

/**
 * Deterministic PRNG (mulberry32).
 *
 * `Math.random()` inside a `useMemo` is impure — React may re-run the memo, and
 * the cloud would silently reshuffle. A fixed seed also means the field is
 * identical on every load, so the composition can be art-directed rather than
 * being whatever the dice gave this visitor.
 */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Drifting dust.
 *
 * Two things were wrong with the naive version: `pointsMaterial` renders each
 * point as a hard **square** by default, and at size 0.032 they were large
 * enough to read as debris crossing the hero.
 *
 * The fix is a radial alpha ramp used as the point sprite, which turns every
 * square into a soft round dot, plus a much smaller size and lower opacity.
 * The texture is a `DataTexture` built from arithmetic rather than a canvas —
 * no DOM access during render, so it stays pure and works identically under
 * the React Compiler's rules.
 *
 * Motion is a slow yaw plus two long out-of-phase sines. The periods (0.08 and
 * 0.12) are deliberately not multiples of each other, so the field never
 * visibly returns to the same arrangement.
 */
function Particles({ count = 340 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const random = makeRandom(0x5eed);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Distribute on a shell rather than a solid ball, so the interior stays
      // clear and the shapes read against the cloud instead of inside it.
      const radius = 4.2 + random() * 3.4;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i * 3 + 2] = radius * Math.cos(phi) - 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  /** 32×32 radial alpha ramp — the sprite that makes the points round. */
  const sprite = useMemo(() => {
    const size = 32;
    const data = new Uint8Array(size * size * 4);
    const half = size / 2;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x - half + 0.5;
        const dy = y - half + 0.5;
        const distance = Math.sqrt(dx * dx + dy * dy) / half;
        // Pow > 1 keeps the core solid and lets only the rim feather, which
        // reads as a dot rather than as a blur.
        const alpha = Math.pow(Math.max(0, 1 - distance), 1.7);
        const i = (y * size + x) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = Math.round(alpha * 255);
      }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // three.js allocates GPU buffers per geometry/texture and will not free them
  // when React unmounts the component.
  useEffect(
    () => () => {
      geometry.dispose();
      sprite.dispose();
    },
    [geometry, sprite],
  );

  useFrame((state) => {
    const points = ref.current;
    if (!points) return;
    const t = state.clock.elapsedTime;
    points.rotation.y = t * 0.018;
    points.rotation.x = Math.sin(t * 0.08) * 0.05;
    points.position.y = Math.sin(t * 0.12) * 0.14;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.016}
        map={sprite}
        alphaMap={sprite}
        color="#101211"
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Camera parallax.
 *
 * The camera eases toward the pointer instead of tracking it, which is the
 * difference between "responsive" and "twitchy". Lerping inside `useFrame`
 * (rather than animating on pointermove) also means the work is bounded by the
 * render loop, not by event frequency.
 */
function CameraRig() {
  // Reused across frames so the loop allocates nothing.
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // `camera` and `pointer` are read from the per-frame state rather than from
  // `useThree()`. Same objects, but React's immutability rule (rightly) rejects
  // mutating a hook's return value — and the three.js scene graph is
  // imperative by design, so it has to be mutated somewhere.
  useFrame(({ camera, pointer }, delta) => {
    // Frame-rate independent easing: converges at the same rate at 60 and 120Hz.
    const alpha = 1 - Math.pow(0.001, delta);
    camera.position.x += (pointer.x * 0.85 - camera.position.x) * alpha;
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * alpha;
    camera.lookAt(target);
  });

  return null;
}

export interface HeroSceneProps {
  /** Set false when the hero leaves the viewport to stop the render loop. */
  active?: boolean;
}

export default function HeroScene({ active = true }: HeroSceneProps) {
  // Shared geometry instances — created once, reused by every Solid.
  const geometries = useMemo<Record<SolidKind, THREE.BufferGeometry>>(
    () => ({
      ico: new THREE.IcosahedronGeometry(1, 0),
      sphere: new THREE.SphereGeometry(1, 48, 48),
      torus: new THREE.TorusGeometry(0.8, 0.26, 24, 72),
    }),
    [],
  );

  return (
    <Canvas
      // `demand` would freeze the animation; instead we suspend the loop
      // entirely via `active` when the hero scrolls away.
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 7], fov: 42 }}
      // The canvas is decorative; keep it out of the accessibility tree and
      // out of the pointer path so it never steals a click from the CTA.
      aria-hidden
      style={{ pointerEvents: "none" }}
    >
      {/* Neutral key from upper right, faint lime bounce from lower left —
          the two-light setup a product photographer would use, which is why
          the matte solids read as physical rather than as flat WebGL. The
          bounce is what ties the greys back to the accent. */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 5, 4]} intensity={1.5} color="#ffffff" />
      <directionalLight
        position={[-5, -2, 2]}
        intensity={0.75}
        color="#d9e8b4"
      />

      <CameraRig />
      <Particles />

      {SOLIDS.map((solid, i) => (
        <Solid
          key={solid.color + i}
          {...solid}
          phase={i * 1.37}
          geometries={geometries}
        />
      ))}
    </Canvas>
  );
}
