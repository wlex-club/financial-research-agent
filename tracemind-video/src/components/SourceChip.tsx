import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { softSpring } from "../tokens/motion";

type Props = {
  id: string;
  appearAtFrame: number;
  variant?: "default" | "warn";
};

export const SourceChip: React.FC<Props> = ({
  id,
  appearAtFrame,
  variant = "default",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = softSpring(frame, fps, appearAtFrame);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const bg = variant === "warn" ? colors.signalWarn : colors.clay;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        background: bg,
        color: "#FFFFFF",
        fontFamily: fonts.mono,
        fontSize: 14,
        letterSpacing: 0.4,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {id}
    </span>
  );
};
