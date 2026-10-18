package com.invoicely.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class InvoiceRequest {

    private Object client;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private List<InvoiceItemDto> items;

    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal total;
    private String notes;
    private String status;

    public InvoiceRequest() {}

    public Long getClientId() {
        if (client == null) return null;
        if (client instanceof Number) {
            return ((Number) client).longValue();
        }
        if (client instanceof String) {
            try {
                return Long.parseLong((String) client);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        if (client instanceof Map<?, ?> map) {
            Object idVal = map.get("_id");
            if (idVal == null) idVal = map.get("id");
            if (idVal instanceof Number) return ((Number) idVal).longValue();
            if (idVal instanceof String) {
                try {
                    return Long.parseLong((String) idVal);
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
    }

    public Object getClient() { return client; }
    public void setClient(Object client) { this.client = client; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public List<InvoiceItemDto> getItems() { return items; }
    public void setItems(List<InvoiceItemDto> items) { this.items = items; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
