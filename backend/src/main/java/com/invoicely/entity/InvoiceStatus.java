package com.invoicely.entity;

public enum InvoiceStatus {
    DRAFT("draft"),
    SENT("sent"),
    PAID("paid"),
    OVERDUE("overdue");

    private final String value;

    InvoiceStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static InvoiceStatus fromString(String text) {
        if (text == null) return DRAFT;
        for (InvoiceStatus status : InvoiceStatus.values()) {
            if (status.value.equalsIgnoreCase(text) || status.name().equalsIgnoreCase(text)) {
                return status;
            }
        }
        return DRAFT;
    }
}
