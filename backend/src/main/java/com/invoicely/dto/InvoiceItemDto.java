package com.invoicely.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class InvoiceItemDto {
    private Long id;
    private String description;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal amount;

    public InvoiceItemDto() {}

    public InvoiceItemDto(Long id, String description, Integer quantity, BigDecimal price, BigDecimal amount) {
        this.id = id;
        this.description = description;
        this.quantity = quantity;
        this.price = price;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonProperty("_id")
    public Long getUnderscoreId() { return id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
