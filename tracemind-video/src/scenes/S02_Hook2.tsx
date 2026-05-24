import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { TypographicLine } from "../components/TypographicLine";

export const S02_Hook2: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 1400, textAlign: "center" }}>
        <TypographicLine
          text="but in making every line defensible."
          startFrame={6}
          staggerFrames={1}
          fontSize={72}
          underline
        />
      </div>
    </AbsoluteFill>
  );
};
