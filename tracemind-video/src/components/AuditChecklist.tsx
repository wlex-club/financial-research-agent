import React from "react";
import { AuditBadge } from "./AuditBadge";

type Rule = {
  id: string;
  label: string;
  status: "ok" | "warn";
};

type Props = {
  rules: Rule[];
  startFrame: number;
  intervalFrames?: number;
};

export const AuditChecklist: React.FC<Props> = ({
  rules,
  startFrame,
  intervalFrames = 12,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      {rules.map((rule, i) => (
        <AuditBadge
          key={rule.id}
          label={rule.label}
          status={rule.status}
          appearAtFrame={startFrame + i * intervalFrames}
        />
      ))}
    </div>
  );
};
