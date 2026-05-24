import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { HypothesisCard } from "../components/HypothesisCard";
import data from "../data/hypotheses.json";

export const S06_Hypotheses: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
        padding: 120,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: "100%",
          maxWidth: 1500,
        }}
      >
        <HypothesisCard
          label={data.main.label}
          claim={data.main.claim}
          sources={data.main.sources}
          appearAtFrame={6}
          direction="left"
          accent="primary"
        />
        <div
          style={{
            height: 1,
            background: colors.sand,
            width: "100%",
          }}
        />
        <HypothesisCard
          label={data.alternative.label}
          claim={data.alternative.claim}
          sources={data.alternative.sources}
          appearAtFrame={18}
          direction="right"
          accent="alternative"
        />
      </div>

      <div
        style={{
          marginTop: 36,
          fontFamily: fonts.mono,
          fontSize: 14,
          color: colors.warmGray,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        protocol.competing_hypotheses
      </div>
    </AbsoluteFill>
  );
};
