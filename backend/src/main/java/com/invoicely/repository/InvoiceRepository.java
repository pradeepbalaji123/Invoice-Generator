package com.invoicely.repository;

import com.invoicely.entity.Invoice;
import com.invoicely.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUserIdOrderByIdDesc(Long userId);

    Optional<Invoice> findByIdAndUserId(Long id, Long userId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.user.id = :userId AND i.status = :status")
    BigDecimal sumTotalByUserIdAndStatus(@Param("userId") Long userId, @Param("status") InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE i.status = :status AND i.dueDate < :currentDate")
    List<Invoice> findOverdueInvoices(@Param("status") InvoiceStatus status, @Param("currentDate") LocalDate currentDate);
}
