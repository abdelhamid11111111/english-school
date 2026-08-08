import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: this project is nested inside a multi-project
  // folder, and without this Turbopack walks up and picks the wrong lockfile.
  turbopack: { root: path.resolve(__dirname) },

  images: {
    // Course/student photography is served from Unsplash in this build.
    // Swap these for your own CDN hostname when real brand assets land.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    // Next.js 16 requires an explicit allow-list of optimizer quality values.
    qualities: [70, 85],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Barrel-file optimisation: only the icons/motion primitives actually
    // referenced get pulled into the client bundle.
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
