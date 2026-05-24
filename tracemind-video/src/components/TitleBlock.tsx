import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts, sizes } from "../tokens/type";
import { softSpring } from "../tokens/motion";

type Props = {
  title: string;
  subtitle?: string;
  delayFrames?: number;
};

export const TitleBlock: React.FC<Props> = ({
  title,
  subtitle,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = softSpring(frame, fps, delayFrames);
  const subtitleProgress = softSpring(frame, fps, delayFrames + 6);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: fonts.serif,
          fontSize: sizes.h1,
          color: colors.ink,
          letterSpacing: "-0.005em",
          lineHeight: 1.05,
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [8, 0])}px)`,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: sizes.small,
            color: colors.warmGray,
            opacity: subtitleProgress,
            transform: `translateY(${interpolate(subtitleProgress, [0, 1], [6, 0])}px)`,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
