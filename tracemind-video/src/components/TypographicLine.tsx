import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts, sizes } from "../tokens/type";

type Props = {
  text: string;
  startFrame?: number;
  staggerFrames?: number;
  fontSize?: number;
  color?: string;
  underline?: boolean;
};

export const TypographicLine: React.FC<Props> = ({
  text,
  startFrame = 0,
  staggerFrames = 1,
  fontSize = sizes.h2,
  color = colors.ink,
  underline = false,
}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);

  const underlineProgress = interpolate(
    frame,
    [startFrame + chars.length * staggerFrames, startFrame + chars.length * staggerFrames + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize,
          color,
          letterSpacing: "-0.005em",
          lineHeight: 1.25,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {chars.map((ch, i) => {
          const local = startFrame + i * staggerFrames;
          const opacity = interpolate(
            frame,
            [local, local + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const y = interpolate(
            frame,
            [local, local + 8],
            [6, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <span
              key={`${ch}-${i}`}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                display: "inline-block",
                whiteSpace: "pre",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      {underline ? (
        <div
          style={{
            height: 1,
            background: colors.ink,
            width: `${underlineProgress * 100}%`,
            transition: "none",
          }}
        />
      ) : null}
    </div>
  );
};
