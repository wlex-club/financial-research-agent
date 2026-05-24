import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { ProductFrame } from "../components/ProductFrame";
import { TypewriterText } from "../components/TypewriterText";
import { ReActStep } from "../components/ReActStep";

const followupSteps = [
  {
    kind: "thought" as const,
    text: "Reuse prior signals on pricing and inventory; focus on concentration.",
    tool: null,
  },
  {
    kind: "tool" as const,
    text: "audit.recall(report_id=\"r-2024Q3-mt\", topic=\"concentration\")",
    tool: "audit.recall",
  },
  {
    kind: "observation" as const,
    text: "Top-10 distributors account for 41% of revenue; concentration risk stays at 0.42.",
    tool: null,
  },
];

export const S11_Followup: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ProductFrame label="follow-up · reuses prior evidence">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            height: "100%",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: "#FBFAF7",
              border: `1px solid ${colors.sand}`,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 13,
                color: colors.warmGray,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              follow-up
            </span>
            <TypewriterText
              text="What about its customer concentration risk?"
              startFrame={6}
              speedCps={22}
              fontSize={22}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 8,
            }}
          >
            {followupSteps.map((s, i) => (
              <ReActStep
                key={i}
                index={i + 1}
                kind={s.kind}
                text={s.text}
                tool={s.tool}
                appearAtFrame={48 + i * 22}
                variant="followup"
              />
            ))}
          </div>
        </div>
      </ProductFrame>
    </AbsoluteFill>
  );
};
