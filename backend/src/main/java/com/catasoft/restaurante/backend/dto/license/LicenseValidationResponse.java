package com.catasoft.restaurante.backend.dto.license;

import java.time.LocalDateTime;

public class LicenseValidationResponse {
    
    private String licenseCode;
    private String type;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean valid;
    private long daysRemaining;
    private String clientName;
    private String message;
    
    public LicenseValidationResponse() {}
    
    // Getters y Setters
    public String getLicenseCode() {
        return licenseCode;
    }
    
    public void setLicenseCode(String licenseCode) {
        this.licenseCode = licenseCode;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public boolean isValid() {
        return valid;
    }
    
    public void setValid(boolean valid) {
        this.valid = valid;
    }
    
    public long getDaysRemaining() {
        return daysRemaining;
    }
    
    public void setDaysRemaining(long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
} 