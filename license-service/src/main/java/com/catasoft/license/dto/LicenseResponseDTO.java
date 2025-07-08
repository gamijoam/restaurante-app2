package com.catasoft.license.dto;

import com.catasoft.license.model.LicenseType;
import java.time.LocalDateTime;

public class LicenseResponseDTO {
    
    private String licenseCode;
    private LicenseType type;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean valid;
    private long daysRemaining;
    private String clientName;
    private String message;
    
    // Constructor
    public LicenseResponseDTO() {}
    
    // Getters y Setters
    public String getLicenseCode() {
        return licenseCode;
    }
    
    public void setLicenseCode(String licenseCode) {
        this.licenseCode = licenseCode;
    }
    
    public LicenseType getType() {
        return type;
    }
    
    public void setType(LicenseType type) {
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