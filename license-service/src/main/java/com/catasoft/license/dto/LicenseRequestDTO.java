package com.catasoft.license.dto;

import com.catasoft.license.model.LicenseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class LicenseRequestDTO {
    
    @NotBlank(message = "El fingerprint es requerido")
    private String fingerprint;
    
    @NotNull(message = "El tipo de licencia es requerido")
    private LicenseType licenseType;
    
    @NotBlank(message = "El nombre del cliente es requerido")
    private String clientName;
    
    private String clientContact;
    
    private String notes;
    
    @Min(value = 1, message = "La duración debe ser mayor a 0")
    private Integer duration; // Duración personalizada en horas o días según el tipo
    
    // Constructor
    public LicenseRequestDTO() {}
    
    // Getters y Setters
    public String getFingerprint() {
        return fingerprint;
    }
    
    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }
    
    public LicenseType getLicenseType() {
        return licenseType;
    }
    
    public void setLicenseType(LicenseType licenseType) {
        this.licenseType = licenseType;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
    
    public String getClientContact() {
        return clientContact;
    }
    
    public void setClientContact(String clientContact) {
        this.clientContact = clientContact;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
} 