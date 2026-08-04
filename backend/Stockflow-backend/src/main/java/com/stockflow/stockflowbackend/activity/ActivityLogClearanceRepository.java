package com.stockflow.stockflowbackend.activity;

import com.stockflow.stockflowbackend.model.ActivityLogClearance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityLogClearanceRepository extends JpaRepository<ActivityLogClearance, Long> {

    Optional<ActivityLogClearance> findByBusinessIdAndYearAndMonth(Long businessId, Integer year, Integer month);

    List<ActivityLogClearance> findByBusinessId(Long businessId);
}
