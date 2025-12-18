package com.liveops.shared.models;

import java.time.Instant;
import java.util.List;

public class AIAnalysisEvent {
    private String analysisId;
    private String incidentId;
    private String rootCauseHypothesis;
    private Double confidenceScore;
    private List<String> impactedServices;
    private List<String> suggestedActions;
    private String technicalSummary;
    private String executiveSummary;
    private Instant analyzedAt;
    
    public AIAnalysisEvent() {}
    
    public AIAnalysisEvent(String analysisId, String incidentId, 
                          String rootCauseHypothesis, Double confidenceScore,
                          List<String> impactedServices, List<String> suggestedActions,
                          String technicalSummary, String executiveSummary,
                          Instant analyzedAt) {
        this.analysisId = analysisId;
        this.incidentId = incidentId;
        this.rootCauseHypothesis = rootCauseHypothesis;
        this.confidenceScore = confidenceScore;
        this.impactedServices = impactedServices;
        this.suggestedActions = suggestedActions;
        this.technicalSummary = technicalSummary;
        this.executiveSummary = executiveSummary;
        this.analyzedAt = analyzedAt;
    }
    
    // Getters and setters
    public String getAnalysisId() { return analysisId; }
    public void setAnalysisId(String analysisId) { this.analysisId = analysisId; }
    
    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    
    public String getRootCauseHypothesis() { return rootCauseHypothesis; }
    public void setRootCauseHypothesis(String rootCauseHypothesis) { 
        this.rootCauseHypothesis = rootCauseHypothesis; 
    }
    
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { 
        this.confidenceScore = confidenceScore; 
    }
    
    public List<String> getImpactedServices() { return impactedServices; }
    public void setImpactedServices(List<String> impactedServices) { 
        this.impactedServices = impactedServices; 
    }
    
    public List<String> getSuggestedActions() { return suggestedActions; }
    public void setSuggestedActions(List<String> suggestedActions) { 
        this.suggestedActions = suggestedActions; 
    }
    
    public String getTechnicalSummary() { return technicalSummary; }
    public void setTechnicalSummary(String technicalSummary) { 
        this.technicalSummary = technicalSummary; 
    }
    
    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { 
        this.executiveSummary = executiveSummary; 
    }
    
    public Instant getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(Instant analyzedAt) { this.analyzedAt = analyzedAt; }
}