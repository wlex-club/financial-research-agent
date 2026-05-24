import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { TypographicLine } from "../components/TypographicLine";
import { LogoMark } from "../components/LogoMark";

export const S12_Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 36,
          alignItems: "center",
        }}
      >
        <TypographicLine
          text="Research is no longer a black box — it's a path you can walk back."
          startFrame={6}
          staggerFrames={1}
          fontSize={56}
          underline
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 12,
          }}
        >
          <LogoMark size={36} startFrame={70} variant="end" />
          <div
            style={{
              fontFamily: fonts.serif,
              fontSize: 32,
              color: colors.ink,
              letterSpacing: "-0.005em",
            }}
          >
            TraceMind
          </div>
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 14,
            color: colors.warmGray,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          auditable financial research agent
        </div>
      </div>
    </AbsoluteFill>
  );
};
