import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { FaithfulnessDiff } from "../components/FaithfulnessDiff";
import claimSource from "../data/claim-source.json";

export const S08_Faithfulness: React.FC = () => {
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
          width: "100%",
          maxWidth: 1500,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 16,
            color: colors.warmGray,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          protocol.faithfulness · per-claim check
        </div>
        <FaithfulnessDiff
          claim={claimSource.claim}
          source={claimSource.source}
          matchedSpans={claimSource.matchedSpans as [number, number][]}
          startFrame={10}
        />
      </div>
    </AbsoluteFill>
  );
};
