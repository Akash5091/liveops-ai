import React, { useEffect, useState } from "react";
import { api } from "../api";
import { getRole, setRole } from "../state/session";
import { Role } from "../types";
import { Badge } from "./Badge";

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(getRole());
  const [health, setHealth] = useState<"ok" | "degraded" | "down">("ok");

  useEffect(() => {
    let mounted = true;
    api.health()
      .then((h) => mounted && setHealth(h.status))
      .catch(() => mounted && setHealth("down"));
    const t = setInterval(() => {
      api.health()
        .then((h) => mounted && setHealth(h.status))
        .catch(() => mounted && setHealth("down"));
    }, 8000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  function changeRole(next: Role) {
    setRole(next);
    setRoleState(next);
  }

  return (
    <div className="container">
      <div className="row space wrap" style={{ marginBottom: 14 }}>
        <div className="row wrap" style={{ gap: 10 }}>
          <div className="card cardPad" style={{ padding: 12 }}>
            <div className="row space" style={{ gap: 12 }}>
              <div>
                <div className="h1">LiveOps AI</div>
                <div className="small muted">Real-time incident intelligence</div>
              </div>
              <Badge kind={health} text={health.toUpperCase()} />
            </div>
          </div>

          <div className="card cardPad" style={{ padding: 12 }}>
            <div className="h2" style={{ marginBottom: 8 }}>Navigation</div>
            <div className="row wrap">
              <a className="btn" href="#/dashboard">Dashboard</a>
              <a className="btn" href="#/incidents">Incidents</a>
            </div>
          </div>
        </div>

        <div className="card cardPad" style={{ padding: 12, minWidth: 240 }}>
          <div className="h2" style={{ marginBottom: 8 }}>Session</div>
          <div className="row space">
            <div>
              <div className="small muted">Role</div>
              <div style={{ fontWeight: 700 }}>{role}</div>
            </div>
            <select
              className="select"
              value={role}
              onChange={(e) => changeRole(e.target.value as Role)}
              aria-label="Role"
            >
              <option value="engineer">engineer</option>
              <option value="manager">manager</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row space" style={{ marginBottom: 12 }}>
        <div>
          <div className="h1">{title}</div>
          <div className="small muted">Auto-refresh enabled</div>
        </div>
      </div>

      {children}
    </div>
  );
}
