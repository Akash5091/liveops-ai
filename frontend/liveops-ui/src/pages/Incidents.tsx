import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { getRole } from "../state/session";
import { Incident } from "../types";
import { IncidentTable } from "../components/IncidentTable";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";

export default function Incidents() {
  const role = getRole();
  const [all, setAll] = useState<Incident[]>([]);
  const [severity, setSeverity] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState<string>("");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setErr("");
        const items = await api.incidents();
        if (!mounted) return;
        // Sort newest first
        items.sort((a, b) => (new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()));
        setAll(items);
      } catch (e) {
        if (!mounted) return;
        setErr(String(e));
      }
    }
    load();
    const t = setInterval(load, 2500);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const filtered = useMemo(() => {
    return all.filter((x) => {
      if (severity !== "all" && x.severity !== severity) return false;
      if (status !== "all" && x.status !== status) return false;
      if (q.trim()) {
        const s = `${x.incident_key} ${x.title} ${x.primary_service_key ?? ""}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [all, severity, status, q]);

  if (err) return <Empty title="Incidents unavailable" hint={err} />;
  if (!all.length) return <Loading text="Loading incidents..." />;

  return (
    <>
      <div className="row wrap" style={{ marginBottom: 14 }}>
        <input
          className="input"
          placeholder="Search incident key, title, service..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 260 }}
        />
        <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">all severities</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="critical">critical</option>
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">all statuses</option>
          <option value="open">open</option>
          <option value="acknowledged">acknowledged</option>
          <option value="mitigated">mitigated</option>
          <option value="resolved">resolved</option>
          <option value="false_positive">false_positive</option>
        </select>
      </div>

      {!filtered.length ? (
        <Empty title="No incidents match filters" hint="Try clearing filters or run the demo script to trigger a spike." />
      ) : (
        <IncidentTable incidents={filtered} role={role} />
      )}
    </>
  );
}
