package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByBusinessIdAndPhone(Long businessId, String phone);

    Optional<Customer> findByBusinessIdAndId(Long businessId, Long id);

    List<Customer> findByBusinessIdOrderByNameAsc(Long businessId);
}
