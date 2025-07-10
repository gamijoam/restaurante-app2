package com.catasoft.restaurante.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BusinessConfigDTO {
    
    private Long id;
    private String businessName;
    private String taxId;
    private String address;
    private String phone;
    private String email;
    private String website;
    private String logoUrl;
    private String description;
    private BigDecimal taxRate;
    private String currency;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor vacío
    public BusinessConfigDTO() {}
    
    // Constructor completo
    public BusinessConfigDTO(Long id, String businessName, String taxId, String address, 
                           String phone, String email, String website, String logoUrl, 
                           String description, BigDecimal taxRate, String currency, 
                           Boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.businessName = businessName;
        this.taxId = taxId;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.website = website;
        this.logoUrl = logoUrl;
        this.description = description;
        this.taxRate = taxRate;
        this.currency = currency;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getBusinessName() {
        return businessName;
    }
    
    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
    
    public String getTaxId() {
        return taxId;
    }
    
    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public String getLogoUrl() {
        return logoUrl;
    }
    
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getTaxRate() {
        return taxRate;
    }
    
    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 