package com.liveops.shared.models;

import java.time.Instant;
import java.util.List;

public class IncidentEvent {
    private String incidentId;
    private String title;
    private String description;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String status; // OPEN, INVESTIGATING, RESOLVED
    private String serviceName;
    private List<String> affectedServices;
    private String detectionMethod; // THRESHOLD, ANOMALY, MANUAL
    private Instant detectedAt;
    private Instant resolvedAt;
    
    public IncidentEvent() {}
    
    public IncidentEvent(String incidentId, String title, String description,
                        String severity, String status, String serviceName,
                        List<String> affectedServices, String detectionMethod,
                        Instant detectedAt) {
        this.incidentId = incidentId;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.serviceName = serviceName;
        this.affectedServices = affectedServices;
        this.detectionMethod = detectionMethod;
        this.detectedAt = detectedAt;
    }
    
    // Getters and setters
    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    
    public List<String> getAffectedServices() { return affectedServices; }
    public void setAffectedServices(List<String> affectedServices) { 
        this.affectedServices = affectedServices; 
    }
    
    public String getDetectionMethod() { return detectionMethod; }
    public void setDetectionMethod(String detectionMethod) { 
        this.detectionMethod = detectionMethod; 
    }
    
    public Instant getDetectedAt() { return detectedAt; }
    public void setDetectedAt(Instant detectedAt) { this.detectedAt = detectedAt; }
    
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}