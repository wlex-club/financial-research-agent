import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { softSpring } from "../tokens/motion";

type Kind = "thought" | "tool" | "observation";

type Props = {
  index: number;
  kind: Kind;
  text: string;
  tool?: string | null;
  appearAtFrame: number;
  variant?: "default" | "followup";
};

const KIND_LABELS: Record<Kind, string> = {
  thought: "Thought",
  tool: "Tool",
  observation: "Observation",
};

export const ReActStep: React.FC<Props> = ({
  index,
  kind,
  text,
  tool,
  appearAtFrame,
  variant = "default",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = softSpring(frame, fps, appearAtFrame);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const y = interpolate(progress, [0, 1], [8, 0]);

  const accent = variant === "followup" ? colors.signalOk : colors.clay;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        gap: 16,
        padding: "14px 18px",
        borderRadius: 10,
        background: "#FBFAF7",
        border: `1px solid ${colors.sand}`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 14,
          color: accent,
          minWidth: 32,
        }}
      >
        {String(index).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 13,
            color: colors.warmGray,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {KIND_LABELS[kind]}
          {tool ? ` · ${tool}` : ""}
        </div>
        <div
          style={{
            fontFamily: kind === "tool" ? fonts.mono : fonts.sans,
            fontSize: kind === "tool" ? 18 : 22,
            color: colors.ink,
            lineHeight: 1.45,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
