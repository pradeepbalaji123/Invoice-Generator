package com.invoicely.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String companyName;
    private String address;
    private String phone;
    private String logo;

    public UserDto() {}

    public UserDto(Long id, String name, String email, String companyName, String address, String phone, String logo) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.companyName = companyName;
        this.address = address;
        this.phone = phone;
        this.logo = logo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonProperty("_id")
    public Long getUnderscoreId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
}
