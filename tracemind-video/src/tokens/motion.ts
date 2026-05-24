import { spring, SpringConfig } from "remotion";

export const springs = {
  soft: {
    damping: 18,
    mass: 0.6,
    stiffness: 100,
  } satisfies Partial<SpringConfig>,
  firm: {
    damping: 22,
    mass: 0.7,
    stiffness: 140,
  } satisfies Partial<SpringConfig>,
} as const;

export const easeIn = (frame: number, startFrame: number, duration: number) => {
  const t = Math.max(0, Math.min(1, (frame - startFrame) / duration));
  return t * t * (3 - 2 * t);
};

export const softSpring = (
  frame: number,
  fps: number,
  startFrame: number = 0
) =>
  spring({
    frame: frame - startFrame,
    fps,
    config: springs.soft,
  });
