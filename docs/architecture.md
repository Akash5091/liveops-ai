# LiveOps AI Architecture

## System Overview

LiveOps AI is built on an event-driven microservices architecture designed for real-time performance monitoring and incident intelligence.

## Core Principles

1. **Event-Driven**: All communication between services uses Kafka event streaming
2. **Loosely Coupled**: Services operate independently with clear boundaries
3. **Scalable**: Each service can scale horizontally based on load
4. **Observable**: Built-in monitoring and health checks
5. **Resilient**: Circuit breakers and fallback mechanisms

## Service Architecture

### Metrics Service (Port 8081)
**Responsibility**: Metric ingestion and aggregation

**Endpoints**:
- `POST /api/metrics` - Ingest new metrics
- `GET /api/metrics/live` - WebSocket for live metric stream
- `GET /api/metrics/aggregated` - Query aggregated metrics

**Data Flow**:
1. Receives metrics via REST API
2. Validates and enriches metric data
3. Publishes to Kafka topic: `metrics.raw`
4. Aggregates metrics (1min, 5min, 15min windows)
5. Caches hot data in Redis
6. Stores historical data in PostgreSQL

### Incident Service (Port 8082)
**Responsibility**: Anomaly detection and incident management

**Endpoints**:
- `GET /api/incidents` - List all incidents
- `GET /api/incidents/{id}` - Get incident details
- `POST /api/incidents` - Create manual incident
- `PATCH /api/incidents/{id}` - Update incident status

**Data Flow**:
1. Consumes from Kafka topic: `metrics.aggregated`
2. Runs anomaly detection algorithms:
   - Threshold-based detection
   - Statistical deviation (Z-score)
   - Time-series forecasting
3. Creates incident when anomaly detected
4. Publishes to Kafka topic: `incidents.detected`
5. Stores incidents in PostgreSQL

### AI Analysis Service (Port 8083)
**Responsibility**: AI-powered incident root cause analysis

**Endpoints**:
- `GET /api/analysis/{incidentId}` - Get AI analysis
- `POST /api/analysis/generate` - Trigger analysis

**Data Flow**:
1. Consumes from Kafka topic: `incidents.detected`
2. Gathers context:
   - Recent metrics from affected services
   - Historical incident patterns
   - Service dependency graph
3. Calls OpenAI GPT-4 API with structured prompt
4. Parses AI response into structured format
5. Publishes to Kafka topic: `analysis.completed`
6. Stores analysis in PostgreSQL

## Event Schema

### Kafka Topics

```
metrics.raw           - Raw metric events
metrics.aggregated    - Aggregated metric windows
incidents.detected    - New incidents
incidents.updated     - Incident status changes
analysis.completed    - AI analysis results
```

### Event Retention

- `metrics.raw`: 7 days
- `metrics.aggregated`: 30 days
- `incidents.*`: 90 days
- `analysis.*`: 90 days

## Database Schema

### PostgreSQL Tables

**metrics**
- id (UUID)
- service_name (VARCHAR)
- metric_type (VARCHAR)
- value (NUMERIC)
- tags (JSONB)
- timestamp (TIMESTAMPTZ)

**incidents**
- id (UUID)
- title (VARCHAR)
- description (TEXT)
- severity (VARCHAR)
- status (VARCHAR)
- service_name (VARCHAR)
- affected_services (TEXT[])
- detected_at (TIMESTAMPTZ)
- resolved_at (TIMESTAMPTZ)

**ai_analyses**
- id (UUID)
- incident_id (UUID FK)
- root_cause (TEXT)
- confidence (NUMERIC)
- impacted_services (TEXT[])
- suggested_actions (TEXT[])
- technical_summary (TEXT)
- executive_summary (TEXT)
- analyzed_at (TIMESTAMPTZ)

## Caching Strategy (Redis)

**Keys**:
- `metrics:live:{serviceName}` - Last 100 metrics per service
- `metrics:agg:{serviceName}:{window}` - Aggregated metrics
- `incidents:active` - List of open incidents
- `analysis:{incidentId}` - Cached AI analysis (TTL: 1 hour)

## Security

### Authentication Flow

1. User submits credentials to Auth Service
2. JWT token issued with roles (ENGINEER, MANAGER)
3. Token included in all API requests
4. Services validate token via shared secret

### Authorization Matrix

| Endpoint | Engineer | Manager |
|----------|----------|----------|
| View Metrics | ✓ | ✓ |
| View Incidents | ✓ | ✓ |
| Create Incident | ✓ | ✗ |
| Update Incident | ✓ | ✗ |
| View AI Analysis | ✓ | ✓ |
| System Admin | ✓ | ✗ |

## Performance Targets

- Metric ingestion: < 50ms p99
- Incident detection: < 5 seconds from metric
- AI analysis: < 30 seconds from detection
- Dashboard load: < 2 seconds
- Live updates: < 500ms latency

## Scaling Strategy

### Horizontal Scaling
- All services stateless
- Kafka consumer groups for load distribution
- Redis cluster for cache distribution

### Vertical Scaling
- PostgreSQL: Increase connections pool
- Kafka: Add partitions for higher throughput

## Monitoring

Each service exposes:
- `/actuator/health` - Health check
- `/actuator/metrics` - Prometheus metrics
- `/actuator/info` - Build and version info