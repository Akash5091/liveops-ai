package com.liveops.metrics.repository;

import com.liveops.metrics.model.MetricEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface MetricRepository extends JpaRepository<MetricEntity, UUID> {
    
    List<MetricEntity> findByServiceNameAndTimestampBetweenOrderByTimestampDesc(
        String serviceName, Instant start, Instant end);
    
    List<MetricEntity> findTop100ByServiceNameOrderByTimestampDesc(String serviceName);
    
    @Query("SELECT m FROM MetricEntity m WHERE m.serviceName = :serviceName " +
           "AND m.metricType = :metricType AND m.timestamp >= :since " +
           "ORDER BY m.timestamp DESC")
    List<MetricEntity> findRecentMetrics(
        @Param("serviceName") String serviceName,
        @Param("metricType") String metricType,
        @Param("since") Instant since);
}