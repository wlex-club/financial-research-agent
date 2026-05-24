import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { softSpring } from "../tokens/motion";
import { SourceChip } from "./SourceChip";

type Props = {
  label: string;
  claim: string;
  sources: string[];
  appearAtFrame: number;
  direction?: "left" | "right";
  accent?: "primary" | "alternative";
};

export const HypothesisCard: React.FC<Props> = ({
  label,
  claim,
  sources,
  appearAtFrame,
  direction = "left",
  accent = "primary",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = softSpring(frame, fps, appearAtFrame);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const x = interpolate(
    progress,
    [0, 1],
    [direction === "left" ? -20 : 20, 0]
  );

  const accentColor = accent === "primary" ? colors.clay : colors.warmGray;

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        padding: 32,
        background: "#FFFFFF",
        border: `1px solid ${colors.sand}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 14,
          color: accentColor,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: 32,
          color: colors.ink,
          lineHeight: 1.35,
        }}
      >
        {claim}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {sources.map((s, i) => (
          <SourceChip
            key={s}
            id={s}
            appearAtFrame={appearAtFrame + 6 + i * 4}
          />
        ))}
      </div>
    </div>
  );
};
