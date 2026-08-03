import { Fraunces, Work_Sans, Roboto_Mono, Caveat } from "next/font/google";

// Self-hosted via next/font/google (downloaded and served at build time, no
// runtime call to Google's CDN) so the canvas — which is the actual print
// file, not just on-screen decoration — renders identically regardless of
// what the visitor's OS/browser has installed. Fraunces/Work Sans match the
// options already loaded in src/app/[locale]/layout.tsx; calling them again
// here with identical config is deduped by Next.js, not a second download.
const sans = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });
const serif = Fraunces({ subsets: ["latin"], weight: "variable", axes: ["opsz"] });
const mono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "700"] });
const script = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

export type CustomizerFontId = "sans" | "serif" | "mono" | "script";

export type CustomizerFont = {
  id: CustomizerFontId;
  label: string;
  /** Real font-family string (e.g. "__Roboto_Mono_abc123") — usable both as
   *  a CSS value and as Konva/Canvas 2D's `fontFamily`, unlike a CSS custom
   *  property which Canvas cannot resolve. */
  fontFamily: string;
};

export const CUSTOMIZER_FONTS: readonly CustomizerFont[] = [
  { id: "sans", label: "Sans", fontFamily: sans.style.fontFamily },
  { id: "serif", label: "Serif", fontFamily: serif.style.fontFamily },
  { id: "mono", label: "Monospace", fontFamily: mono.style.fontFamily },
  { id: "script", label: "Script", fontFamily: script.style.fontFamily },
];

export function getCustomizerFont(id: CustomizerFontId): CustomizerFont {
  return CUSTOMIZER_FONTS.find((font) => font.id === id) ?? CUSTOMIZER_FONTS[0];
}

// Canvas text draws with whatever font is already loaded in `document.fonts`
// at draw time — unlike regular DOM text, it does NOT wait for webfonts
// itself, so a first paint before the font finishes loading silently falls
// back to a system font. Call this (and await it) before any Konva text
// layer first renders, and again right before the final export in
// DesignCompositor — the export is the actual print file, and a silent
// fallback there would ship a design in the wrong font undetected.
export async function ensureCustomizerFontsLoaded(): Promise<void> {
  await Promise.all(
    CUSTOMIZER_FONTS.map((font) => document.fonts.load(`16px "${font.fontFamily}"`))
  );
  await document.fonts.ready;
}
