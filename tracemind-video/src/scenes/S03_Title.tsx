import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { LogoMark } from "../components/LogoMark";
import { TitleBlock } from "../components/TitleBlock";

export const S03_Title: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        <LogoMark size={96} startFrame={4} />
        <TitleBlock
          title="TraceMind"
          subtitle="Auditable Financial Research Agent"
          delayFrames={14}
        />
      </div>
    </AbsoluteFill>
  );
};
