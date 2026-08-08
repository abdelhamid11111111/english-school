import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Type.
 *
 * Inter, as a single variable family across display and body. Hierarchy comes
 * from weight and tracking, not from a second typeface — which is why the
 * scale in `globals.css` tightens letter-spacing as size grows.
 *
 * Loaded as a variable font with `display: swap` and self-hosted by next/font
 * at build time, so there is no render-blocking request to a font CDN and no
 * FOUT-driven layout shift.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://lumen-english.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lumen English — Speak with confidence, not just correctness",
    template: "%s · Lumen English",
  },
  description:
    "A language school built around how people actually talk. Small groups, native tutors, and a curriculum shaped to your life — from first words to IELTS band 8.",
  keywords: [
    "English school",
    "English classes",
    "IELTS preparation",
    "business English",
    "private English tutor",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Lumen English",
    title: "Lumen English — Speak with confidence, not just correctness",
    description:
      "Small groups, native tutors, and a curriculum shaped to your life. From first words to IELTS band 8.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen English",
    description:
      "Speak with confidence, not just correctness. Small groups, native tutors, real conversation.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfa",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Swap to "midnight" or "coral" to re-skin the entire site.
      data-palette="lime"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="bg-bg text-ink min-h-full flex flex-col overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
