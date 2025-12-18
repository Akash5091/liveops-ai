import React from "react";
import { Incident, Role } from "../types";
import { Badge } from "./Badge";

function fmt(ts: string) {
  const d = new Date(ts);
  return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

export function IncidentTable({ incidents, role }: { incidents: Incident[]; role: Role }) {
  return (
    <div className="card cardPad">
      <table className="table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Incident</th>
            <th>Service</th>
            <th>Status</th>
            <th>Detected</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.incident_key}>
              <td><Badge kind={inc.severity} text={inc.severity.toUpperCase()} /></td>
              <td>
                <a href={`#/incidents/${encodeURIComponent(inc.incident_key)}`} style={{ fontWeight: 800 }}>
                  {inc.title}
                </a>
                <div className="small muted">{inc.incident_key}</div>
                {role === "engineer" && inc.labels?.length ? (
                  <div className="small muted" style={{ marginTop: 6 }}>
                    labels: {inc.labels.join(", ")}
                  </div>
                ) : null}
              </td>
              <td>{inc.primary_service_key || "—"}</td>
              <td>{inc.status}</td>
              <td>{fmt(inc.detected_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
