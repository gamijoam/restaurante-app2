package com.catasoft.license.dto;

import jakarta.validation.constraints.NotBlank;

public class ValidateRequestDTO {
    
    @NotBlank(message = "El código de licencia es requerido")
    private String licenseCode;
    
    @NotBlank(message = "El fingerprint es requerido")
    private String fingerprint;
    
    // Constructor
    public ValidateRequestDTO() {}
    
    public ValidateRequestDTO(String licenseCode, String fingerprint) {
        this.licenseCode = licenseCode;
        this.fingerprint = fingerprint;
    }
    
    // Getters y Setters
    public String getLicenseCode() {
        return licenseCode;
    }
    
    public void setLicenseCode(String licenseCode) {
        this.licenseCode = licenseCode;
    }
    
    public String getFingerprint() {
        return fingerprint;
    }
    
    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }
} 