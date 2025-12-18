import React from "react";
import { IncidentEvidence } from "../types";

function fmt(ts: string) {
  const d = new Date(ts);
  return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

export function EvidenceList({ evidence }: { evidence: IncidentEvidence[] }) {
  return (
    <div className="card cardPad">
      <div className="h2" style={{ marginBottom: 10 }}>Evidence</div>
      <table className="table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Observed</th>
            <th>Baseline</th>
            <th>Threshold</th>
            <th>Z</th>
            <th>Bucket</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((e, i) => (
            <tr key={i}>
              <td>
                <div style={{ fontWeight: 800 }}>{e.metric_key}</div>
                <div className="small muted">{e.service_key}</div>
                {e.note ? <div className="small muted" style={{ marginTop: 6 }}>{e.note}</div> : null}
              </td>
              <td>{e.observed_value}</td>
              <td>{e.baseline_value ?? "—"}</td>
              <td>{e.threshold_value ?? "—"}</td>
              <td>{e.z_score ?? "—"}</td>
              <td>{fmt(e.bucket_start)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
