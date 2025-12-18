import { AiSummary, Health, Incident, IncidentDetail, LatestMetrics, Service } from "./types";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => http<Health>("/api/health"),
  services: () => http<Service[]>("/api/services"),
  latestMetrics: (serviceKey: string) =>
    http<LatestMetrics>(`/api/metrics/latest?service_key=${encodeURIComponent(serviceKey)}`),
  incidents: () => http<Incident[]>("/api/incidents"),
  incidentDetail: (incidentKey: string) =>
    http<IncidentDetail>(`/api/incidents/${encodeURIComponent(incidentKey)}`),
  aiSummary: (incidentKey: string) =>
    http<AiSummary>(`/api/summaries/${encodeURIComponent(incidentKey)}`)
};
