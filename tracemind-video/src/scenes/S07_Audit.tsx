import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../tokens/colors";
import { fonts } from "../tokens/type";
import { AuditChecklist } from "../components/AuditChecklist";
import rules from "../data/audit-rules.json";

export const S07_Audit: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        alignItems: "center",
        justifyContent: "center",
        padding: 160,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 28,
          maxWidth: 1280,
          width: "100%",
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
          protocol.audit
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: 48,
            color: colors.ink,
            letterSpacing: "-0.005em",
            lineHeight: 1.2,
          }}
        >
          Four rules, lit one by one — the ones that should fail, do.
        </div>
        <AuditChecklist
          rules={rules as { id: string; label: string; status: "ok" | "warn" }[]}
          startFrame={12}
          intervalFrames={14}
        />
      </div>
    </AbsoluteFill>
  );
};
