package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_config")
public class BusinessConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;
    
    @Column(name = "tax_id", length = 50)
    private String taxId; // RIF
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "phone", length = 50)
    private String phone;
    
    @Column(name = "email", length = 255)
    private String email;
    
    @Column(name = "website", length = 255)
    private String website;
    
    @Column(name = "logo_url", length = 500)
    private String logoUrl;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = new BigDecimal("16.00"); // Porcentaje de impuesto por defecto
    
    @Column(name = "currency", length = 10)
    private String currency = "USD";
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructores
    public BusinessConfig() {}
    
    public BusinessConfig(String businessName, String taxId, String address, String phone) {
        this.businessName = businessName;
        this.taxId = taxId;
        this.address = address;
        this.phone = phone;
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