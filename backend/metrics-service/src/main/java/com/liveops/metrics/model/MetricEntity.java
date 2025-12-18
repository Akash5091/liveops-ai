package com.liveops.metrics.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "metrics", indexes = {
    @Index(name = "idx_service_time", columnList = "service_name,timestamp"),
    @Index(name = "idx_metric_type", columnList = "metric_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "service_name", nullable = false)
    private String serviceName;
    
    @Column(name = "metric_type", nullable = false)
    private String metricType;
    
    @Column(name = "value", nullable = false)
    private Double value;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "jsonb")
    private Map<String, String> tags;
    
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;
    
    @Column(name = "created_at")
    private Instant createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}