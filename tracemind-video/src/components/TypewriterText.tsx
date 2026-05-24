import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";

type Props = {
  text: string;
  startFrame?: number;
  speedCps?: number;
  fontSize?: number;
  showCaret?: boolean;
};

export const TypewriterText: React.FC<Props> = ({
  text,
  startFrame = 0,
  speedCps = 20,
  fontSize = 28,
  showCaret = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - startFrame) / fps;
  const charsShown = Math.min(text.length, Math.floor(elapsed * speedCps));
  const visible = text.slice(0, charsShown);

  const caretOn = Math.floor(frame / 12) % 2 === 0;

  return (
    <span
      style={{
        fontFamily: fonts.sans,
        fontSize,
        color: colors.ink,
        whiteSpace: "pre",
      }}
    >
      {visible}
      {showCaret ? (
        <span
          style={{
            opacity: caretOn ? 1 : 0,
            color: colors.clay,
            marginLeft: 2,
          }}
        >
          |
        </span>
      ) : null}
    </span>
  );
};
