import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";

type Props = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  startFrame: number;
  durationFrames?: number;
};

export const CursorPointer: React.FC<Props> = ({
  from,
  to,
  startFrame,
  durationFrames = 18,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ease = progress * progress * (3 - 2 * progress);
  const x = from.x + (to.x - from.x) * ease;
  const y = from.y + (to.y - from.y) * ease;

  return (
    <svg
      width={24}
      height={28}
      viewBox="0 0 24 28"
      style={{
        position: "absolute",
        left: x,
        top: y,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
      }}
    >
      <path
        d="M2 2 L2 22 L8 17 L11 24 L14 23 L11 16 L19 16 Z"
        fill={colors.ink}
        stroke="#FFFFFF"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </svg>
  );
};
