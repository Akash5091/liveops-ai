import React from "react";
import { AiSummary, Role } from "../types";

export function AiSummaryCard({ summary, role }: { summary: AiSummary; role: Role }) {
  return (
    <div className="card cardPad">
      <div className="row space">
        <div>
          <div className="h2">AI Summary</div>
          <div className="small muted">
            {summary.model_name} · {summary.prompt_version}
            {typeof summary.confidence === "number" ? ` · confidence ${Math.round(summary.confidence * 100)}%` : ""}
          </div>
        </div>
      </div>

      <div className="hr" />

      <div style={{ fontSize: 14, lineHeight: 1.55 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>What happened</div>
        <div className="muted">{summary.summary}</div>

        {role === "engineer" && summary.root_cause_hypothesis ? (
          <>
            <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 6 }}>Likely cause</div>
            <div className="muted">{summary.root_cause_hypothesis}</div>
          </>
        ) : null}

        {summary.next_steps ? (
          <>
            <div style={{ fontWeight: 900, marginTop: 14, marginBottom: 6 }}>Next steps</div>
            <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{summary.next_steps}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
