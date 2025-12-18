#!/usr/bin/env bash
set -euo pipefail

METRICS_URL="${METRICS_URL:-http://localhost:8081/api/metrics}"
INCIDENTS_URL="${INCIDENTS_URL:-http://localhost:8082/api/incidents}"
AI_URL_BASE="${AI_URL_BASE:-http://localhost:8083/api/summaries}"

SERVICE_KEY="${SERVICE_KEY:-inventory-service}"
METRIC_KEY="${METRIC_KEY:-http.latency.p95_ms}"
UNIT="${UNIT:-ms}"

DIMENSIONS_JSON='{"region":"us-central","endpoint_group":"public"}'

echo "== LiveOps AI Demo =="
echo "Metrics endpoint : $METRICS_URL"
echo "Incidents endpoint: $INCIDENTS_URL"
echo "Service          : $SERVICE_KEY"
echo ""

# helper: ISO8601 UTC minute bucket
bucket_utc() {
  date -u +"%Y-%m-%dT%H:%M:00Z"
}

post_metric() {
  local value="$1"
  local bucket="$2"
  local corr="${3:-demo-corr-$(date +%s)}"

  local payload
  payload=$(cat <<EOF
{
  "service_key": "$SERVICE_KEY",
  "metric_key": "$METRIC_KEY",
  "bucket_start": "$bucket",
  "value": $value,
  "unit": "$UNIT",
  "dimensions": $DIMENSIONS_JSON,
  "correlation_id": "$corr"
}
EOF
)

  curl -sS -X POST "$METRICS_URL" \
    -H "Content-Type: application/json" \
    -d "$payload" >/dev/null

  echo "Sent metric: $METRIC_KEY=$value $UNIT @ $bucket"
}

echo "Step 1) Sending baseline metrics..."
CORR_ID="demo-corr-$(date +%s)"
B1="$(bucket_utc)"
post_metric 195.0 "$B1" "$CORR_ID"

sleep 5
B2="$(bucket_utc)"
post_metric 205.0 "$B2" "$CORR_ID"

echo ""
echo "Step 2) Triggering latency spike..."
sleep 5
B3="$(bucket_utc)"
post_metric 1850.0 "$B3" "$CORR_ID"

echo ""
echo "Step 3) Waiting for an incident to be created..."

attempts=30
sleep_secs=2
found_key=""

for i in $(seq 1 $attempts); do
  resp="$(curl -sS "$INCIDENTS_URL")"

  found_key="$(echo "$resp" | jq -r --arg svc "$SERVICE_KEY" '
    ( .incidents // . // [] )
    | map(select((.primary_service_key // .primaryServiceKey // "") == $svc))
    | sort_by(.detected_at // .detectedAt // .created_at // .createdAt)
    | reverse
    | .[0].incident_key // .[0].incidentKey // empty
  ')"

  if [[ -n "$found_key" ]]; then
    echo "Incident found: $found_key"
    break
  fi

  echo "  not yet... ($i/$attempts)"
  sleep "$sleep_secs"
done

if [[ -z "$found_key" ]]; then
  echo "No incident detected within timeout."
  echo "Tip: ensure incident-service detection threshold is configured for p95 latency."
  exit 1
fi

echo ""
echo "Step 4) Fetching incident details..."
DETAIL_URL="$INCIDENTS_URL/$found_key"
curl -sS "$DETAIL_URL" | jq .

echo ""
echo "Step 5) Fetching AI summary (if available)..."
AI_URL="$AI_URL_BASE/$found_key"
if curl -sS "$AI_URL" >/dev/null 2>&1; then
  curl -sS "$AI_URL" | jq .
else
  echo "AI summary endpoint not reachable (optional). Skipping."
fi

echo ""
echo "Done. Open the UI to see it live: http://localhost:3000"
