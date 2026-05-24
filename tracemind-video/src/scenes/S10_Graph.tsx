import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { CursorPointer } from "../components/CursorPointer";
import { Tooltip } from "../components/Tooltip";

type Node = {
  id: string;
  label: string;
  type: "company" | "customer" | "regulator" | "source";
  x: number;
  y: number;
};

const NODES: Node[] = [
  { id: "n1", label: "Kweichow Moutai", type: "company", x: 760, y: 380 },
  { id: "n2", label: "Distributor network", type: "customer", x: 510, y: 260 },
  { id: "n3", label: "Overseas buyers", type: "customer", x: 1020, y: 270 },
  { id: "n4", label: "SAMR regulator", type: "regulator", x: 420, y: 480 },
  { id: "n5", label: "S-05 Q3 prelim", type: "source", x: 1080, y: 510 },
  { id: "n6", label: "S-07 price weekly", type: "source", x: 600, y: 580 },
];

const EDGES: Array<[string, string]> = [
  ["n1", "n2"],
  ["n1", "n3"],
  ["n1", "n4"],
  ["n1", "n5"],
  ["n1", "n6"],
  ["n2", "n6"],
];

const TYPE_COLOR: Record<Node["type"], string> = {
  company: "#1A1A1A",
  customer: "#CC785C",
  regulator: "#D08C3A",
  source: "#7A8C5A",
};

export const S10_Graph: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const yaw = interpolate(frame, [0, fps * 7], [-2, 2]);
  const target = NODES.find((n) => n.id === "n3")!;

  const findById = (id: string) => NODES.find((n) => n.id === id)!;

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
          position: "relative",
          width: 1600,
          height: 820,
          background: "#FBFAF7",
          borderRadius: 16,
          border: `1px solid ${colors.sand}`,
          overflow: "hidden",
          padding: 24,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 14,
            color: colors.warmGray,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            position: "absolute",
            top: 24,
            left: 24,
          }}
        >
          Entity graph · companies · customers · regulators
        </div>
        <div
          style={{
            transform: `perspective(1600px) rotateY(${yaw}deg)`,
            transformOrigin: "center",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <svg
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
          >
            {EDGES.map(([a, b], i) => {
              const na = findById(a);
              const nb = findById(b);
              return (
                <line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={colors.warmGray}
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              );
            })}
          </svg>
          {NODES.map((n) => {
            const r = n.type === "company" ? 28 : 18;
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: n.x - r,
                  top: n.y - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: 999,
                  background: "#FFFFFF",
                  border: `2px solid ${TYPE_COLOR[n.type]}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: TYPE_COLOR[n.type],
                  fontFamily: fonts.sans,
                  fontSize: n.type === "company" ? 14 : 12,
                  fontWeight: 500,
                  textAlign: "center",
                  padding: 2,
                }}
              >
                {n.label}
              </div>
            );
          })}
        </div>
        <CursorPointer
          from={{ x: 1300, y: 700 }}
          to={{ x: target.x + 16, y: target.y + 4 }}
          startFrame={36}
          durationFrames={36}
        />
        <Tooltip
          x={target.x + 30}
          y={target.y - 36}
          title={target.label}
          meta="customer · 12 outbound"
          startFrame={84}
        />
      </div>
    </AbsoluteFill>
  );
};
