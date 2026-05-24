import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { RiskRadar } from "../components/RiskRadar";
import { DecisionCard } from "../components/DecisionCard";
import decision from "../data/decision.json";

export const S09_RiskDecision: React.FC = () => {
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
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 80,
          alignItems: "center",
          width: "100%",
          maxWidth: 1500,
        }}
      >
        <RiskRadar dims={decision.risks} startFrame={6} />
        <DecisionCard
          rating={decision.rating as "watch"}
          ratingLabel={decision.ratingLabel}
          confidence={decision.confidence}
          indicators={decision.indicators}
          startFrame={30}
        />
      </div>
    </AbsoluteFill>
  );
};
