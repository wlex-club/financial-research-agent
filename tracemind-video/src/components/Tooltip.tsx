import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";

type Props = {
  x: number;
  y: number;
  title: string;
  meta?: string;
  startFrame: number;
};

export const Tooltip: React.FC<Props> = ({
  x,
  y,
  title,
  meta,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const yOffset = interpolate(
    frame,
    [startFrame, startFrame + 10],
    [4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + yOffset,
        opacity,
        background: colors.ink,
        color: "#FFFFFF",
        padding: "10px 14px",
        borderRadius: 8,
        fontFamily: fonts.sans,
        fontSize: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontWeight: 500 }}>{title}</div>
      {meta ? (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 13,
            opacity: 0.7,
            marginTop: 4,
          }}
        >
          {meta}
        </div>
      ) : null}
    </div>
  );
};
