import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";

type Props = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  startFrame: number;
  durationFrames?: number;
};

export const LinkLine: React.FC<Props> = ({
  from,
  to,
  startFrame,
  durationFrames = 24,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const minX = Math.min(from.x, to.x) - 4;
  const minY = Math.min(from.y, to.y) - 4;
  const w = Math.abs(to.x - from.x) + 8;
  const h = Math.abs(to.y - from.y) + 8;

  const length = Math.sqrt(
    (to.x - from.x) ** 2 + (to.y - from.y) ** 2
  );

  return (
    <svg
      style={{
        position: "absolute",
        left: minX,
        top: minY,
        width: w,
        height: h,
        pointerEvents: "none",
      }}
    >
      <line
        x1={from.x - minX}
        y1={from.y - minY}
        x2={to.x - minX}
        y2={to.y - minY}
        stroke={colors.warmGray}
        strokeWidth={1.2}
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
    </svg>
  );
};
