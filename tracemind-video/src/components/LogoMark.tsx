import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { softSpring } from "../tokens/motion";

type Props = {
  size?: number;
  startFrame?: number;
  variant?: "intro" | "end";
};

export const LogoMark: React.FC<Props> = ({
  size = 64,
  startFrame = 0,
  variant = "intro",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = softSpring(frame, fps, startFrame);
  const translateX = interpolate(progress, [0, 1], [-24, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const stroke = variant === "end" ? colors.ink : colors.ink;
  const inner = variant === "end" ? colors.clay : colors.clay;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="6"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
      <path
        d="M18 22 H46 M32 22 V44"
        stroke={inner}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
