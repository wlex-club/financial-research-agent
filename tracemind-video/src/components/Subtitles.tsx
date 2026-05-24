import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { SUBTITLES } from "../data/subtitles";

const FADE_FRAMES = 6;

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = SUBTITLES.find(
    (c) => frame >= c.startFrame && frame < c.endFrame
  );

  if (!cue || cue.hideOverlay) return null;

  const localFrame = frame - cue.startFrame;
  const duration = cue.endFrame - cue.startFrame;
  const fadeIn = interpolate(localFrame, [0, FADE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    localFrame,
    [duration - FADE_FRAMES, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 72,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          maxWidth: 1280,
          padding: "14px 26px",
          borderRadius: 8,
          background: "rgba(26,26,26,0.78)",
          color: "#FAF7F2",
          fontFamily: fonts.sans,
          fontSize: 24,
          lineHeight: 1.4,
          textAlign: "center",
          letterSpacing: 0.1,
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          border: `1px solid ${colors.sand}22`,
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
