import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { softSpring } from "../tokens/motion";

type Dim = {
  label: string;
  value: number;
};

type Props = {
  dims: Dim[];
  startFrame: number;
};

const LABELS: Record<string, string> = {
  regulatory: "Regulatory",
  concentration: "Customer concentration",
  commercialization: "Commercialization",
  margin_pressure: "Margin pressure",
};

export const RiskRadar: React.FC<Props> = ({ dims, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: "100%",
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 14,
          color: colors.warmGray,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        Risk radar
      </div>
      {dims.map((d, i) => {
        const local = startFrame + i * 8;
        const progress = softSpring(frame, fps, local);
        const width = interpolate(progress, [0, 1], [0, d.value * 100]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        return (
          <div
            key={d.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              opacity,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: fonts.sans,
                fontSize: 18,
                color: colors.inkSoft,
              }}
            >
              <span>{LABELS[d.label] ?? d.label}</span>
              <span style={{ fontFamily: fonts.mono, color: colors.warmGray }}>
                {Math.round(d.value * 100)}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 8,
                background: colors.sand,
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${width}%`,
                  height: "100%",
                  background:
                    d.value > 0.6 ? colors.signalWarn : colors.clay,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
