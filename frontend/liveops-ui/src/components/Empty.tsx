import React from "react";
export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card cardPad">
      <div style={{ fontWeight: 900 }}>{title}</div>
      {hint ? <div className="small muted" style={{ marginTop: 6 }}>{hint}</div> : null}
    </div>
  );
}
