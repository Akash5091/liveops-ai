import React, { useEffect, useState } from "react";
import { api } from "../api";
import { getRole } from "../state/session";
import { AiSummary, IncidentDetail as Detail } from "../types";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { Badge } from "../components/Badge";
import { EvidenceList } from "../components/EvidenceList";
import { AiSummaryCard } from "../components/AiSummaryCard";

function fmt(ts: string) {
  const d = new Date(ts);
  return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

export default function IncidentDetail({ incidentKey }: { incidentKey: string }) {
  const role = getRole();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [ai, setAi] = useState<AiSummary | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setErr("");
        const d = await api.incidentDetail(incidentKey);
        if (!mounted) return;
        setDetail(d);
      } catch (e) {
        if (!mounted) return;
        setErr(String(e));
        setDetail(null);
      }
    }

    async function loadAi() {
      try {
        const s = await api.aiSummary(incidentKey);
        if (!mounted) return;
        setAi(s);
      } catch {
        if (!mounted) return;
        setAi(null);
      }
    }

    load();
    loadAi();
    const t = setInterval(() => {
      load();
      loadAi();
    }, 2500);

    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [incidentKey]);

  if (err) return <Empty title="Incident not available" hint={err} />;
  if (!detail) return <Loading text="Loading incident detail..." />;

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="card cardPad">
        <div className="row space wrap">
          <div style={{ minWidth: 280 }}>
            <div className="small muted">{detail.incident_key}</div>
            <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>{detail.title}</div>
            {detail.description ? <div className="muted" style={{ marginTop: 8 }}>{detail.description}</div> : null}
          </div>

          <div className="row wrap">
            <Badge kind={detail.severity} text={detail.severity.toUpperCase()} />
            <span className="pill"><span className="small muted">status</span> <b>{detail.status}</b></span>
            <span className="pill"><span className="small muted">service</span> <b>{detail.primary_service_key || "—"}</b></span>
          </div>
        </div>

        <div className="hr" />

        <div className="row wrap" style={{ gap: 10 }}>
          <span className="pill"><span className="small muted">started</span> <b>{fmt(detail.started_at)}</b></span>
          <span className="pill"><span className="small muted">detected</span> <b>{fmt(detail.detected_at)}</b></span>
          {role === "engineer" && detail.labels?.length ? (
            <span className="pill"><span className="small muted">labels</span> <b>{detail.labels.join(", ")}</b></span>
          ) : null}
        </div>
      </div>

      {ai ? <AiSummaryCard summary={ai} role={role} /> : (
        <Empty title="AI summary not available yet" hint="This is optional. If ai-analysis-service is running, it will appear automatically." />
      )}

      {detail.evidence?.length ? <EvidenceList evidence={detail.evidence} /> : (
        <Empty title="No evidence attached" hint="Ensure incident-service writes evidence metrics when raising incidents." />
      )}
    </div>
  );
}
