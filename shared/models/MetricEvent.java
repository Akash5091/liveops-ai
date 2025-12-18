package com.liveops.shared.models;

import java.time.Instant;
import java.util.Map;

public class MetricEvent {
    private String eventId;
    private String serviceName;
    private String metricType; // LATENCY, ERROR_RATE, REQUEST_COUNT, THROUGHPUT
    private Double value;
    private Map<String, String> tags;
    private Instant timestamp;
    
    public MetricEvent() {}
    
    public MetricEvent(String eventId, String serviceName, String metricType, 
                      Double value, Map<String, String> tags, Instant timestamp) {
        this.eventId = eventId;
        this.serviceName = serviceName;
        this.metricType = metricType;
        this.value = value;
        this.tags = tags;
        this.timestamp = timestamp;
    }
    
    // Getters and setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    
    public String getMetricType() { return metricType; }
    public void setMetricType(String metricType) { this.metricType = metricType; }
    
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
    
    public Map<String, String> getTags() { return tags; }
    public void setTags(Map<String, String> tags) { this.tags = tags; }
    
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}