package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.model.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Long> {
}

