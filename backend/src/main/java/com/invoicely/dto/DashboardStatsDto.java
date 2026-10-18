package com.invoicely.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {
    private long clientCount;
    private BigDecimal totalRevenue;
    private long totalInvoices;
    private long paidInvoices;
    private long overdueInvoices;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long clientCount, BigDecimal totalRevenue, long totalInvoices, long paidInvoices, long overdueInvoices) {
        this.clientCount = clientCount;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
        this.totalInvoices = totalInvoices;
        this.paidInvoices = paidInvoices;
        this.overdueInvoices = overdueInvoices;
    }

    public long getClientCount() { return clientCount; }
    public void setClientCount(long clientCount) { this.clientCount = clientCount; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }

    public long getPaidInvoices() { return paidInvoices; }
    public void setPaidInvoices(long paidInvoices) { this.paidInvoices = paidInvoices; }

    public long getOverdueInvoices() { return overdueInvoices; }
    public void setOverdueInvoices(long overdueInvoices) { this.overdueInvoices = overdueInvoices; }
}
