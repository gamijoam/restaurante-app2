package com.catasoft.license.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "licenses")
public class License {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String licenseCode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LicenseType type;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private boolean active;
    
    @Column
    private String clientName;
    
    @Column
    private String clientContact;
    
    @Column
    private String notes;
    
    // Constructor
    public License() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
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
    
    // Métodos de utilidad
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isValid() {
        return active && !isExpired();
    }
    
    public long getDaysRemaining() {
        if (type == LicenseType.PERPETUAL) {
            return Long.MAX_VALUE;
        }
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).toDays();
    }
} 