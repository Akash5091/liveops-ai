-- db/seed.sql
-- Seed core services + metric definitions. Safe to run multiple times.

-- Ensure extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- SERVICES
INSERT INTO services (service_key, display_name, owner_team, tier)
VALUES
  ('api-gateway',       'API Gateway',        'platform', 'tier-0'),
  ('auth-service',      'Auth Service',       'platform', 'tier-1'),
  ('inventory-service', 'Inventory Service',  'core',     'tier-1'),
  ('checkout-service',  'Checkout Service',   'core',     'tier-1'),
  ('payments-service',  'Payments Service',   'core',     'tier-0'),
  ('search-service',    'Search Service',     'growth',   'tier-2'),
  ('notifications',     'Notifications',      'growth',   'tier-2')
ON CONFLICT (service_key) DO UPDATE
SET display_name = EXCLUDED.display_name,
    owner_team   = EXCLUDED.owner_team,
    tier         = EXCLUDED.tier,
    updated_at   = now();

-- METRIC DEFINITIONS
INSERT INTO metric_definitions (metric_key, unit, description, value_type)
VALUES
  ('http.rps',              'rps', 'HTTP requests per second',                  'gauge'),
  ('http.error_rate_pct',   '%',   'HTTP 5xx error rate percent',               'gauge'),
  ('http.latency.p95_ms',   'ms',  'HTTP p95 latency in milliseconds',          'gauge'),
  ('cpu.util_pct',          '%',   'CPU utilization percent',                   'gauge'),
  ('mem.util_pct',          '%',   'Memory utilization percent',                'gauge'),
  ('db.connections',        'cnt', 'Active DB connections',                     'gauge'),
  ('kafka.consumer_lag',    'cnt', 'Kafka consumer lag (records)',              'gauge')
ON CONFLICT (metric_key) DO UPDATE
SET unit        = EXCLUDED.unit,
    description = EXCLUDED.description,
    value_type  = EXCLUDED.value_type;

-- OPTIONAL: seed a few minutes of baseline metrics for inventory-service
-- This makes charts look good immediately (bucket_start uses now() truncated).
DO $$
DECLARE
  sid UUID;
  t   TIMESTAMPTZ;
BEGIN
  SELECT id INTO sid FROM services WHERE service_key = 'inventory-service';
  t := date_trunc('minute', now()) - interval '10 minutes';

  WHILE t <= date_trunc('minute', now()) LOOP
    INSERT INTO metrics_minute (service_id, metric_key, bucket_start, value, dimensions)
    VALUES
      (sid, 'http.rps',            t, 120 + (random()*10), '{}'::jsonb),
      (sid, 'http.error_rate_pct', t, 0.2 + (random()*0.2), '{}'::jsonb),
      (sid, 'http.latency.p95_ms', t, 180 + (random()*20), '{}'::jsonb),
      (sid, 'cpu.util_pct',        t, 35 + (random()*10), '{}'::jsonb),
      (sid, 'mem.util_pct',        t, 55 + (random()*10), '{}'::jsonb),
      (sid, 'db.connections',      t, 35 + (random()*5),  '{}'::jsonb)
    ON CONFLICT (service_id, metric_key, bucket_start, dimensions) DO NOTHING;

    t := t + interval '1 minute';
  END LOOP;
END $$;
