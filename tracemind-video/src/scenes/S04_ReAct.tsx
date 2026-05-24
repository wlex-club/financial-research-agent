import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { ProductFrame } from "../components/ProductFrame";
import { ReActStep } from "../components/ReActStep";
import steps from "../data/react-steps.json";

type RawStep = (typeof steps)[number];

export const S04_ReAct: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ProductFrame label="protocol.reasoning  ·  ReAct steps · streaming">
        <div style={{ display: "flex", gap: 28, height: "100%" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {(steps as RawStep[]).map((s, i) => (
              <ReActStep
                key={i}
                index={i + 1}
                kind={s.kind as "thought" | "tool" | "observation"}
                text={s.text}
                tool={s.tool}
                appearAtFrame={12 + i * 22}
              />
            ))}
          </div>
          <div
            style={{
              width: 360,
              borderLeft: `1px dashed ${colors.sand}`,
              paddingLeft: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 14,
                color: colors.warmGray,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              context
            </div>
            <div
              style={{
                fontFamily: fonts.sans,
                fontSize: 22,
                color: colors.ink,
                lineHeight: 1.5,
              }}
            >
              Kweichow Moutai · Q3 2024 · risks &amp; margin quality
            </div>
            <div
              style={{
                marginTop: 12,
                fontFamily: fonts.mono,
                fontSize: 13,
                color: colors.warmGray,
              }}
            >
              live · MiroMind API
            </div>
          </div>
        </div>
      </ProductFrame>
    </AbsoluteFill>
  );
};
