package com.liveops.metrics.service;

import com.liveops.metrics.dto.MetricRequest;
import com.liveops.metrics.dto.MetricResponse;
import com.liveops.metrics.model.MetricEntity;
import com.liveops.metrics.repository.MetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricService {
    
    private final MetricRepository metricRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String KAFKA_TOPIC = "metrics.raw";
    private static final String REDIS_KEY_PREFIX = "metrics:live:";
    private static final int REDIS_TTL_MINUTES = 15;
    
    @Transactional
    public MetricResponse ingestMetric(MetricRequest request) {
        // Set timestamp if not provided
        if (request.getTimestamp() == null) {
            request.setTimestamp(Instant.now());
        }
        
        // Save to database
        MetricEntity entity = MetricEntity.builder()
            .serviceName(request.getServiceName())
            .metricType(request.getMetricType())
            .value(request.getValue())
            .tags(request.getTags())
            .timestamp(request.getTimestamp())
            .build();
        
        MetricEntity saved = metricRepository.save(entity);
        log.debug("Saved metric: {} for service: {}", 
                 saved.getMetricType(), saved.getServiceName());
        
        // Publish to Kafka
        publishToKafka(saved);
        
        // Cache in Redis
        cacheMetric(saved);
        
        return toResponse(saved);
    }
    
    private void publishToKafka(MetricEntity metric) {
        try {
            kafkaTemplate.send(KAFKA_TOPIC, metric.getServiceName(), metric);
            log.debug("Published metric to Kafka: {}", metric.getId());
        } catch (Exception e) {
            log.error("Failed to publish metric to Kafka", e);
        }
    }
    
    private void cacheMetric(MetricEntity metric) {
        try {
            String key = REDIS_KEY_PREFIX + metric.getServiceName();
            redisTemplate.opsForList().leftPush(key, metric);
            redisTemplate.opsForList().trim(key, 0, 99); // Keep last 100
            redisTemplate.expire(key, REDIS_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("Failed to cache metric in Redis", e);
        }
    }
    
    public List<MetricResponse> getRecentMetrics(String serviceName, int minutes) {
        Instant since = Instant.now().minus(minutes, ChronoUnit.MINUTES);
        return metricRepository.findByServiceNameAndTimestampBetweenOrderByTimestampDesc(
                serviceName, since, Instant.now())
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    public List<MetricResponse> getLiveMetrics(String serviceName) {
        return metricRepository.findTop100ByServiceNameOrderByTimestampDesc(serviceName)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    private MetricResponse toResponse(MetricEntity entity) {
        return MetricResponse.builder()
            .id(entity.getId())
            .serviceName(entity.getServiceName())
            .metricType(entity.getMetricType())
            .value(entity.getValue())
            .tags(entity.getTags())
            .timestamp(entity.getTimestamp())
            .build();
    }
}