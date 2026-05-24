import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  startFrame: number;
};

export const HighlightBox: React.FC<Props> = ({
  x,
  y,
  width,
  height,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        border: `2px solid ${colors.clay}`,
        borderRadius: 8,
        opacity: progress,
        transform: `scale(${0.98 + progress * 0.02})`,
        boxShadow: `0 0 0 6px ${colors.clay}10`,
        pointerEvents: "none",
      }}
    />
  );
};
