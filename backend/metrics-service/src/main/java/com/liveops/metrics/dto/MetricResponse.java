package com.liveops.metrics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricResponse {
    private UUID id;
    private String serviceName;
    private String metricType;
    private Double value;
    private Map<String, String> tags;
    private Instant timestamp;
}