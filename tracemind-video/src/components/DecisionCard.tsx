import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { softSpring } from "../tokens/motion";

type Rating = "positive" | "watch" | "cautious";

type Props = {
  rating: Rating;
  ratingLabel: string;
  confidence: number;
  indicators: string[];
  startFrame: number;
};

const RATING_COLOR: Record<Rating, string> = {
  positive: "#7A8C5A",
  watch: "#CC785C",
  cautious: "#D08C3A",
};

export const DecisionCard: React.FC<Props> = ({
  rating,
  ratingLabel,
  confidence,
  indicators,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = softSpring(frame, fps, startFrame);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const x = interpolate(progress, [0, 1], [20, 0]);

  const conf = Math.round(confidence * 100);
  const accent = RATING_COLOR[rating];

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        padding: 28,
        background: "#FFFFFF",
        border: `1px solid ${colors.sand}`,
        borderRadius: 14,
        boxShadow: "0 16px 32px rgba(26,26,26,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: 460,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 13,
          color: colors.warmGray,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        Decision card
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 56,
            color: accent,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          {ratingLabel}
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 18,
            color: colors.warmGray,
          }}
        >
          confidence {conf}
        </div>
      </div>
      <div
        style={{
          height: 1,
          background: colors.sand,
        }}
      />
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 13,
          color: colors.warmGray,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        monitoring indicators
      </div>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {indicators.map((ind) => (
          <li
            key={ind}
            style={{
              fontFamily: fonts.sans,
              fontSize: 18,
              color: colors.ink,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                marginTop: 10,
                borderRadius: 999,
                background: accent,
                flexShrink: 0,
              }}
            />
            {ind}
          </li>
        ))}
      </ul>
    </div>
  );
};
