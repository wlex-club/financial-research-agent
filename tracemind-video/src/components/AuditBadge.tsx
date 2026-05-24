import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";

type Status = "ok" | "warn";

type Props = {
  label: string;
  status: Status;
  appearAtFrame: number;
};

export const AuditBadge: React.FC<Props> = ({
  label,
  status,
  appearAtFrame,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [appearAtFrame, appearAtFrame + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const color = status === "ok" ? colors.signalOk : colors.signalWarn;

  const pulse =
    status === "warn"
      ? 0.4 +
        0.6 *
          Math.max(
            0,
            Math.sin(((frame - appearAtFrame) / 8) * Math.PI)
          )
      : 0;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 999,
        border: `1px solid ${color}`,
        background: "transparent",
        color,
        fontFamily: fonts.mono,
        fontSize: 14,
        letterSpacing: 0.4,
        opacity,
        boxShadow:
          status === "warn"
            ? `0 0 0 ${pulse * 6}px ${color}22`
            : "none",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
        }}
      />
      {label} · {status === "ok" ? "pass" : "warn"}
    </div>
  );
};
