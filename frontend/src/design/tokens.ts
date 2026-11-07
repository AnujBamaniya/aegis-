/**
 * AEGIS MATRIX design tokens — single TypeScript source of truth.
 * Mirrors `@theme` / `:root` values in `src/app/globals.css`.
 * docs/DESIGN.md is the authoritative reference; keep both in sync.
 *
 * Consumption contract (per AGENTS.md): UI code should use Tailwind
 * utilities generated from `@theme` (bg-obsidian-loam, font-mono,
 * text-heading, ...) by default; import these constants only where CSS
 * utilities cannot reach (MapLibre style JSON, canvas/SVG attributes).
 */

export const colors = {
  /** Page canvas, hero background, card surfaces. Near-black with a faint olive cast. */
  obsidianLoam: "#13140e",
  /** Primary text: headings, body copy, icon strokes, hairline text on dark. */
  boneVellum: "#f4f3e8",
  /** Hairline borders, footer dividers, low-emphasis rules. */
  ironFilings: "#404040",
  /** Muted secondary text, placeholders, low-contrast labels. */
  driftAsh: "#84837b",
  /** Sole chromatic accent. Decorative emphasis + active states; not the primary CTA color. */
  limeSurveyor: "#ebfc72",
  /** Deeper gradient stop for horizontal lime fades. */
  marshOlive: "#bacd31",
} as const;

export const fonts = {
  /** Display + body voice (next/font → `--font-inter`). */
  sans: "var(--font-inter)",
  /** Technical labels, metadata, numerical information (next/font → `--font-jetbrains-mono`). */
  mono: "var(--font-jetbrains-mono)",
} as const;

export const monoWeights = { light: 300, regular: 400, bold: 700 } as const;

export const typeScale = {
  caption: { size: "13px", lineHeight: 1.2, letterSpacing: "0px" },
  body: { size: "18px", lineHeight: 1.62, letterSpacing: "-0.54px" },
  subheading: { size: "29px", lineHeight: 1.28, letterSpacing: "0px" },
  heading: { size: "58px", lineHeight: 1.06, letterSpacing: "-1.74px" },
  display: { size: "72px", lineHeight: 0.9, letterSpacing: "-2.16px" },
} as const;

/**
 * Spacing scale from DESIGN.md. Deliberately NOT registered in the
 * Tailwind theme (`--spacing-*` namespace): Tailwind v4 computing
 * utilities dynamically means that overrides would silently reshape
 * existing sections (p-5 would drop from 20px to 5px). Plain CSS
 * variables in globals.css :root — used directly, not as utilities.
 */
export const spacingScale = {
  5: "5px",
  7: "7px",
  14: "14px",
  18: "18px",
  21: "21px",
  29: "29px",
  59: "59px",
  86: "86px",
  104: "104px",
  119: "119px",
} as const;

export const spacing = (token: keyof typeof spacingScale): string =>
  `var(--spacing-${token})`;

export const radius = {
  /** Tags, buttons, inputs — the near-zero "instrument panel" corner. */
  tag: "3.6px",
  button: "3.6px",
  input: "3.6px",
  /** Cards are unrounded: md 0px. */
  card: "0px",
} as const;

export const layout = {
  pageMaxWidth: "1200px",
  elementGap: "18px",
  sectionGap: { min: "86px", max: "104px" },
  cardPadding: { min: "14px", max: "18px" },
} as const;
