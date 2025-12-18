package com.liveops.metrics.controller;

import com.liveops.metrics.dto.MetricRequest;
import com.liveops.metrics.dto.MetricResponse;
import com.liveops.metrics.service.MetricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricController {
    
    private final MetricService metricService;
    
    @PostMapping
    public ResponseEntity<MetricResponse> ingestMetric(@Valid @RequestBody MetricRequest request) {
        MetricResponse response = metricService.ingestMetric(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<MetricResponse>> getRecentMetrics(
            @RequestParam String serviceName,
            @RequestParam(defaultValue = "15") int minutes) {
        List<MetricResponse> metrics = metricService.getRecentMetrics(serviceName, minutes);
        return ResponseEntity.ok(metrics);
    }
    
    @GetMapping("/live/{serviceName}")
    public ResponseEntity<List<MetricResponse>> getLiveMetrics(@PathVariable String serviceName) {
        List<MetricResponse> metrics = metricService.getLiveMetrics(serviceName);
        return ResponseEntity.ok(metrics);
    }
}