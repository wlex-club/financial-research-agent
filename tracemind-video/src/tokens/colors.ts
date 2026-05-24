export const colors = {
  paper: "#FAF7F2",
  ink: "#1A1A1A",
  inkSoft: "#3A3A3A",
  warmGray: "#6B6660",
  clay: "#CC785C",
  claySoft: "#E8C9BC",
  sand: "#E8E2D6",
  dusk: "#2B2A28",
  signalWarn: "#D08C3A",
  signalOk: "#7A8C5A",
} as const;

export type ColorToken = keyof typeof colors;
