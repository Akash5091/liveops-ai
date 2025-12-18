import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { getRole } from "../state/session";
import { LatestMetrics, Service } from "../types";
import { StatCard } from "../components/StatCard";
import { ServicePicker } from "../components/ServicePicker";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";

function fmtNum(v: number | undefined, digits = 1) {
  if (v === undefined || v === null || Number.isNaN(v)) return "—";
  return v.toFixed(digits);
}

export default function Dashboard() {
  const role = getRole();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceKey, setServiceKey] = useState<string>("inventory-service");
  const [metrics, setMetrics] = useState<LatestMetrics | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    api.services()
      .then((s) => {
        if (!mounted) return;
        setServices(s);
        if (s.length && !s.find((x) => x.service_key === serviceKey)) {
          setServiceKey(s[0].service_key);
        }
      })
      .catch((e) => mounted && setErr(String(e)));
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setErr("");
      try {
        const m = await api.latestMetrics(serviceKey);
        if (!mounted) return;
        setMetrics(m);
      } catch (e) {
        if (!mounted) return;
        setErr(String(e));
        setMetrics(null);
      }
    }
    load();
    const t = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [serviceKey]);

  const header = useMemo(() => {
    const s = services.find((x) => x.service_key === serviceKey);
    return s ? `${s.display_name} (${s.service_key})` : serviceKey;
  }, [services, serviceKey]);

  if (err) return <Empty title="Dashboard unavailable" hint={err} />;
  if (!services.length) return <Loading text="Loading services..." />;

  return (
    <>
      <div className="row space wrap" style={{ marginBottom: 14 }}>
        <div className="card cardPad" style={{ padding: 12 }}>
          <div className="h2">Selected</div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>{header}</div>
          <div className="small muted" style={{ marginTop: 6 }}>
            Auto-refresh every 3 seconds
          </div>
        </div>

        <ServicePicker services={services} value={serviceKey} onChange={setServiceKey} />
      </div>

      {!metrics ? (
        <Loading text="Loading latest metrics..." />
      ) : (
        <>
          <div className="grid grid4" style={{ marginBottom: 14 }}>
            <StatCard label="RPS" value={fmtNum(metrics.rps, 0)} hint="Requests per second" />
            <StatCard label="Error Rate" value={`${fmtNum(metrics.error_rate_pct, 2)}%`} hint="5xx percentage" />
            <StatCard label="P95 Latency" value={`${fmtNum(metrics.latency_p95_ms, 0)} ms`} hint="Tail latency" />
            <StatCard label="Bucket" value={new Date(metrics.bucket_start).toLocaleTimeString()} hint="Latest minute bucket" />
          </div>

          {role === "engineer" ? (
            <div className="grid grid3">
              <StatCard label="CPU" value={`${fmtNum(metrics.cpu_util_pct, 1)}%`} />
              <StatCard label="Memory" value={`${fmtNum(metrics.mem_util_pct, 1)}%`} />
              <StatCard label="DB Connections" value={fmtNum(metrics.db_connections, 0)} />
            </div>
          ) : (
            <div className="card cardPad">
              <div className="h2">Manager view</div>
              <div className="small muted" style={{ marginTop: 8 }}>
                Managers see the core customer-impact KPIs. Switch to engineer role for system internals.
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
