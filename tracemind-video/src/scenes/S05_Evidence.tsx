import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { ProductFrame } from "../components/ProductFrame";
import { SourceChip } from "../components/SourceChip";
import { LinkLine } from "../components/LinkLine";

const claims = [
  {
    text: "Q3 2024 net margin reached 53.1% — well above the peer median.",
    chips: ["S-02", "S-05"],
  },
  {
    text: "Wholesale price holds near RMB 2,800; channel inventory days improving.",
    chips: ["S-07"],
  },
  {
    text: "Mid-premium revenue grew +22% YoY, providing top-line cushion.",
    chips: ["S-09", "S-11"],
  },
];

const sources = [
  { id: "S-02", title: "Wind · Industry financials" },
  { id: "S-05", title: "Moutai · Q3 2024 prelim" },
  { id: "S-07", title: "Channel price weekly · Nov" },
  { id: "S-09", title: "CMS F&B monthly tracker" },
  { id: "S-11", title: "Company IR briefing" },
];

export const S05_Evidence: React.FC = () => {
  const sourcePositions: Record<string, { x: number; y: number }> = {};
  sources.forEach((s, i) => {
    sourcePositions[s.id] = { x: 1060, y: 96 + i * 56 };
  });

  let chipIndex = 0;
  const claimChipPositions: Array<{
    id: string;
    pos: { x: number; y: number };
    appearAt: number;
  }> = [];

  claims.forEach((c, ci) => {
    c.chips.forEach((chip, idx) => {
      const baseY = 96 + ci * 110;
      const x = 720 + idx * 86;
      claimChipPositions.push({
        id: chip,
        pos: { x, y: baseY },
        appearAt: 24 + chipIndex * 8,
      });
      chipIndex += 1;
    });
  });

  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ProductFrame label="evidence · every claim is bound to a source">
        <div style={{ position: "relative", height: "100%" }}>
          <div
            style={{
              position: "absolute",
              top: 80,
              left: 24,
              width: 680,
              display: "flex",
              flexDirection: "column",
              gap: 50,
            }}
          >
            {claims.map((c, ci) => (
              <div
                key={ci}
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 24,
                  color: colors.ink,
                  lineHeight: 1.45,
                }}
              >
                {c.text}
              </div>
            ))}
          </div>

          {claimChipPositions.map(({ id, pos, appearAt }, i) => (
            <div
              key={`${id}-${i}`}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
              }}
            >
              <SourceChip id={id} appearAtFrame={appearAt} />
            </div>
          ))}

          <div
            style={{
              position: "absolute",
              right: 24,
              top: 80,
              width: 340,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 13,
                color: colors.warmGray,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              sources
            </div>
            {sources.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  fontFamily: fonts.sans,
                  fontSize: 16,
                  color: colors.inkSoft,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 13,
                    color: colors.clay,
                    width: 40,
                    flexShrink: 0,
                  }}
                >
                  {s.id}
                </span>
                {s.title}
              </div>
            ))}
          </div>

          {claimChipPositions.map(({ id, pos, appearAt }, i) => {
            const target = sourcePositions[id];
            if (!target) return null;
            return (
              <LinkLine
                key={`line-${i}`}
                from={{ x: pos.x + 60, y: pos.y + 12 }}
                to={{ x: target.x, y: target.y + 8 }}
                startFrame={appearAt + 6}
              />
            );
          })}
        </div>
      </ProductFrame>
    </AbsoluteFill>
  );
};
