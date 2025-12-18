import React from "react";

export function Badge({ kind, text }: { kind: string; text: string }) {
  const map: Record<string, { bg: string; border: string }> = {
    ok: { bg: "rgba(0,255,140,0.12)", border: "rgba(0,255,140,0.25)" },
    degraded: { bg: "rgba(255,200,0,0.12)", border: "rgba(255,200,0,0.25)" },
    down: { bg: "rgba(255,60,90,0.12)", border: "rgba(255,60,90,0.25)" },

    low: { bg: "rgba(0,255,140,0.10)", border: "rgba(0,255,140,0.25)" },
    medium: { bg: "rgba(255,200,0,0.10)", border: "rgba(255,200,0,0.25)" },
    high: { bg: "rgba(255,120,0,0.10)", border: "rgba(255,120,0,0.25)" },
    critical: { bg: "rgba(255,60,90,0.12)", border: "rgba(255,60,90,0.25)" }
  };

  const style = map[kind] || { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" };

  return (
    <span
      className="pill"
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: style.bg,
        border: `1px solid ${style.border}`,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.08em"
      }}
    >
      {text}
    </span>
  );
}
