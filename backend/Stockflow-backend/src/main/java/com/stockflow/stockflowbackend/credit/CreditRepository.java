package com.stockflow.stockflowbackend.credit;

import com.stockflow.stockflowbackend.model.CreditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CreditRepository extends JpaRepository<CreditRecord, Long> {

    List<CreditRecord> findByCreditorBusinessId(Long businessId);

    List<CreditRecord> findByDebtorBusinessId(Long businessId);

    @Query("SELECT c FROM CreditRecord c WHERE c.status = 'OUTSTANDING' AND c.dueDate < :today")
    List<CreditRecord> findOverdueRecords(@Param("today") LocalDate today);

    List<CreditRecord> findByCreditorBusinessIdAndStatus(Long businessId, String status);

    List<CreditRecord> findByDebtorBusinessIdAndStatus(Long businessId, String status);
}