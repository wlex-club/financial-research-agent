import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";

type Span = [number, number];

type Props = {
  claim: string;
  source: {
    id: string;
    title: string;
    excerpt: string;
  };
  matchedSpans: Span[];
  startFrame: number;
};

const highlight = (
  text: string,
  spans: Span[],
  progress: number
): React.ReactNode[] => {
  if (spans.length === 0) return [text];
  const sorted = [...spans].sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach(([start, end], i) => {
    if (start > cursor) out.push(text.slice(cursor, start));
    const localProgress = Math.max(0, Math.min(1, progress * sorted.length - i));
    out.push(
      <span
        key={`m-${i}`}
        style={{
          background: `${colors.claySoft}${Math.round(localProgress * 255)
            .toString(16)
            .padStart(2, "0")}`,
          borderRadius: 4,
          padding: "0 4px",
        }}
      >
        {text.slice(start, end)}
      </span>
    );
    cursor = end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
};

export const FaithfulnessDiff: React.FC<Props> = ({
  claim,
  source,
  matchedSpans,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          padding: 28,
          borderRadius: 12,
          border: `1px solid ${colors.sand}`,
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 13,
            color: colors.warmGray,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          claim
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 26,
            color: colors.ink,
            lineHeight: 1.5,
          }}
        >
          {highlight(claim, matchedSpans, progress)}
        </div>
      </div>
      <div
        style={{
          padding: 28,
          borderRadius: 12,
          border: `1px solid ${colors.sand}`,
          background: "#FBFAF7",
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 13,
            color: colors.warmGray,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          source · {source.id}
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 22,
            color: colors.inkSoft,
            lineHeight: 1.55,
          }}
        >
          {source.excerpt}
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: fonts.sans,
            fontSize: 16,
            color: colors.warmGray,
          }}
        >
          {source.title}
        </div>
      </div>
    </div>
  );
};
