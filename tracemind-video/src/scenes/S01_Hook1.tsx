import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { softSpring } from "../tokens/motion";

export const S01_Hook1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reportOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const reportY = interpolate(frame, [0, 18], [12, 0], {
    extrapolateRight: "clamp",
  });

  const scanX = interpolate(frame, [12, 60], [-200, 800], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const questionProgress = softSpring(frame, fps, 90);

  return (
    <AbsoluteFill style={{ background: colors.paper }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: reportOpacity,
            transform: `translateY(${reportY}px)`,
            width: 760,
            height: 880,
            background: "#FFFFFF",
            borderRadius: 4,
            boxShadow: "0 32px 64px rgba(0,0,0,0.08)",
            padding: "72px 64px",
            position: "relative",
            overflow: "hidden",
            filter: "blur(0.5px)",
          }}
        >
          <div
            style={{
              fontFamily: fonts.serif,
              fontSize: 36,
              color: colors.ink,
              marginBottom: 32,
              opacity: 0.55,
            }}
          >
            Investment Report · Q3 2026
          </div>
          {Array.from({ length: 14 }).map((_, i) => {
            const widthPct = 70 + ((i * 13) % 25);
            return (
              <div
                key={i}
                style={{
                  height: 14,
                  width: `${widthPct}%`,
                  background:
                    i === 3 || i === 4 || i === 7
                      ? colors.sand
                      : "#EFEAE2",
                  borderRadius: 2,
                  marginBottom: 16,
                  opacity: 0.7,
                }}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: scanX,
              width: 220,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(204,120,92,0.12), transparent)",
            }}
          />
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          right: 220,
          bottom: 140,
          opacity: questionProgress,
          transform: `scale(${interpolate(questionProgress, [0, 1], [0.85, 1])})`,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle
            cx="60"
            cy="60"
            r="56"
            stroke={colors.ink}
            strokeWidth="1.5"
            opacity="0.5"
          />
          <text
            x="60"
            y="78"
            textAnchor="middle"
            fontSize="64"
            fontFamily={fonts.serif}
            fill={colors.ink}
          >
            ?
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
