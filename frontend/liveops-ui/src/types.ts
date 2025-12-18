export type Role = "engineer" | "manager";

export type Service = {
  service_key: string;
  display_name: string;
  tier?: "tier-0" | "tier-1" | "tier-2" | "tier-3";
  owner_team?: string;
};

export type LatestMetrics = {
  service_key: string;
  bucket_start: string;
  rps?: number;
  error_rate_pct?: number;
  latency_p95_ms?: number;
  cpu_util_pct?: number;
  mem_util_pct?: number;
  db_connections?: number;
  kafka_consumer_lag?: number;
};

export type Incident = {
  incident_key: string;
  title: string;
  description?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "acknowledged" | "mitigated" | "resolved" | "false_positive";
  started_at: string;
  detected_at: string;
  primary_service_key?: string;
  labels?: string[];
};

export type IncidentEvidence = {
  service_key: string;
  metric_key: string;
  bucket_start: string;
  observed_value: number;
  baseline_value?: number | null;
  threshold_value?: number | null;
  z_score?: number | null;
  note?: string;
};

export type IncidentDetail = Incident & {
  impacted_services?: { service_key: string; impact_score: number }[];
  evidence?: IncidentEvidence[];
};

export type AiSummary = {
  incident_key: string;
  model_name: string;
  prompt_version: string;
  summary: string;
  root_cause_hypothesis?: string;
  next_steps?: string;
  confidence?: number;
  created_at?: string;
};

export type Health = {
  status: "ok" | "degraded" | "down";
  message?: string;
};
