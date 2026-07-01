package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    List<AppUser> findByBusiness_IdAndIsSubAccountTrue(Long businessId);
}
