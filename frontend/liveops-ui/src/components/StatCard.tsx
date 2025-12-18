import React from "react";

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card cardPad">
      <div className="h2">{label}</div>
      <div className="kpi" style={{ marginTop: 10 }}>{value}</div>
      {hint ? <div className="small muted" style={{ marginTop: 8 }}>{hint}</div> : null}
    </div>
  );
}
