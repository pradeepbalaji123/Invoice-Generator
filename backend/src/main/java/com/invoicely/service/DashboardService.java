package com.invoicely.service;

import com.invoicely.dto.DashboardStatsDto;
import com.invoicely.entity.InvoiceStatus;
import com.invoicely.repository.ClientRepository;
import com.invoicely.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class DashboardService {

    private final ClientRepository clientRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardService(ClientRepository clientRepository, InvoiceRepository invoiceRepository) {
        this.clientRepository = clientRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(Long userId) {
        long clientCount = clientRepository.countByUserId(userId);
        BigDecimal totalRevenue = invoiceRepository.sumTotalByUserIdAndStatus(userId, InvoiceStatus.PAID);
        long totalInvoices = invoiceRepository.countByUserId(userId);

        long paidInvoices = invoiceRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PAID)
                .count();

        long overdueInvoices = invoiceRepository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .filter(i -> i.getStatus() == InvoiceStatus.OVERDUE)
                .count();

        return new DashboardStatsDto(clientCount, totalRevenue, totalInvoices, paidInvoices, overdueInvoices);
    }
}
