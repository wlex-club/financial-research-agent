import React from "react";
import { colors } from "../tokens/colors";

type Props = {
  label?: string;
  width?: number;
  height?: number;
  children: React.ReactNode;
};

export const ProductFrame: React.FC<Props> = ({
  label,
  width = 1480,
  height = 880,
  children,
}) => {
  return (
    <div
      style={{
        width,
        height,
        background: "#FFFFFF",
        borderRadius: 14,
        border: `1px solid ${colors.sand}`,
        boxShadow: "0 24px 48px rgba(26,26,26,0.06)",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {label ? (
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 14,
            color: colors.warmGray,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </div>
      ) : null}
      <div style={{ marginTop: label ? 28 : 0, height: "100%" }}>
        {children}
      </div>
    </div>
  );
};
