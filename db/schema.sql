-- Enable UUID generation (pick one extension; pgcrypto is common)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Services being monitored
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key     TEXT NOT NULL UNIQUE,          -- e.g., "inventory-service"
  display_name    TEXT NOT NULL,                 -- e.g., "Inventory Service"
  owner_team      TEXT,
  tier            TEXT CHECK (tier IN ('tier-0','tier-1','tier-2','tier-3')) DEFAULT 'tier-2',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_service_key ON services(service_key);

-- 2) Metric definitions (what you track)
CREATE TABLE metric_definitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key      TEXT NOT NULL UNIQUE,          -- e.g., "http.latency.p95_ms"
  unit            TEXT NOT NULL,                 -- e.g., "ms", "%", "rps"
  description     TEXT,
  value_type      TEXT NOT NULL CHECK (value_type IN ('gauge','counter','histogram')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Minute-bucketed metrics per service
-- Store common KPIs plus a JSONB for extra dimensions if you want.
CREATE TABLE metrics_minute (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  metric_key      TEXT NOT NULL REFERENCES metric_definitions(metric_key) ON DELETE RESTRICT,

  bucket_start    TIMESTAMPTZ NOT NULL,          -- e.g., 2025-12-17T22:10:00Z
  value           DOUBLE PRECISION NOT NULL,

  -- optional: tags/dimensions like region, az, endpoint group
  dimensions      JSONB NOT NULL DEFAULT '{}'::jsonb,

  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(service_id, metric_key, bucket_start, dimensions)
);

CREATE INDEX idx_metrics_minute_service_bucket ON metrics_minute(service_id, bucket_start DESC);
CREATE INDEX idx_metrics_minute_metric_bucket  ON metrics_minute(metric_key, bucket_start DESC);
CREATE INDEX idx_metrics_minute_dimensions_gin ON metrics_minute USING GIN (dimensions);

-- 4) Incident lifecycle
CREATE TABLE incidents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_key    TEXT NOT NULL UNIQUE,          -- e.g., "INC-20251217-0007"
  title           TEXT NOT NULL,
  description     TEXT,

  severity        TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status          TEXT NOT NULL CHECK (status IN ('open','acknowledged','mitigated','resolved','false_positive')) DEFAULT 'open',

  started_at      TIMESTAMPTZ NOT NULL,
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,

  primary_service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- quick metadata, e.g., "traffic_surge", "db_lock", "deploy_regression"
  labels          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_status_detected ON incidents(status, detected_at DESC);
CREATE INDEX idx_incidents_primary_service ON incidents(primary_service_id);

-- 5) Many-to-many: incidents can impact multiple services
CREATE TABLE incident_services (
  incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  impact_score    DOUBLE PRECISION NOT NULL DEFAULT 0.0,  -- 0..1
  PRIMARY KEY (incident_id, service_id)
);

CREATE INDEX idx_incident_services_service ON incident_services(service_id);

-- 6) Evidence: which metrics contributed to detection (why it triggered)
CREATE TABLE incident_metric_evidence (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  metric_key      TEXT NOT NULL REFERENCES metric_definitions(metric_key),
  bucket_start    TIMESTAMPTZ NOT NULL,
  observed_value  DOUBLE PRECISION NOT NULL,
  baseline_value  DOUBLE PRECISION,
  threshold_value DOUBLE PRECISION,
  z_score         DOUBLE PRECISION,
  note            TEXT
);

CREATE INDEX idx_evidence_incident ON incident_metric_evidence(incident_id);
CREATE INDEX idx_evidence_service_metric_bucket ON incident_metric_evidence(service_id, metric_key, bucket_start DESC);

-- 7) AI summaries: versioned outputs for an incident
CREATE TABLE incident_ai_summaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  model_name      TEXT NOT NULL,                 -- e.g., "gpt-4.1-mini" (or whatever you use)
  prompt_version  TEXT NOT NULL,                 -- e.g., "v1.0"
  summary         TEXT NOT NULL,
  root_cause_hypothesis TEXT,
  next_steps      TEXT,
  confidence      DOUBLE PRECISION CHECK (confidence >= 0 AND confidence <= 1),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(incident_id, model_name, prompt_version, created_at)
);

CREATE INDEX idx_ai_summaries_incident_created ON incident_ai_summaries(incident_id, created_at DESC);

-- 8) Optional: event audit table (helpful for demos + debugging)
CREATE TABLE event_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL,
  topic           TEXT NOT NULL,
  event_id        TEXT NOT NULL,
  correlation_id  TEXT,
  payload         JSONB NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_audit_type_time ON event_audit(event_type, received_at DESC);
CREATE INDEX idx_event_audit_payload_gin ON event_audit USING GIN(payload);
