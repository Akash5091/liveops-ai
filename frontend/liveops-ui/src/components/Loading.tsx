import React from "react";
export function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="card cardPad">
      <div className="muted">{text}</div>
    </div>
  );
}
