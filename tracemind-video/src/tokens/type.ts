export const fonts = {
  serif: '"Source Serif 4", "Tiempos Headline", "Noto Serif SC", Georgia, serif',
  sans: '"Inter", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", Menlo, monospace',
} as const;

export const sizes = {
  display: 96,
  h1: 72,
  h2: 56,
  h3: 40,
  body: 28,
  small: 20,
  micro: 16,
} as const;

export const tracking = {
  serif: -0.005,
  sans: 0,
  mono: 0,
} as const;
