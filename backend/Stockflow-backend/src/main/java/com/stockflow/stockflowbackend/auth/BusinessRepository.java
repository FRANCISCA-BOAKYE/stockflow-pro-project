package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.model.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    boolean existsByName(String name);
    List<Business> findBySubscriptionStatus(String subscriptionStatus);
}