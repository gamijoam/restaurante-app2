package com.catasoft.license.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activations")
public class Activation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "license_id", nullable = false)
    private License license;
    
    @Column(nullable = false)
    private String fingerprint;
    
    @Column(nullable = false)
    private LocalDateTime activatedAt;
    
    @Column
    private String machineInfo;
    
    @Column
    private String ipAddress;
    
    @Column
    private boolean active;
    
    // Constructor
    public Activation() {
        this.activatedAt = LocalDateTime.now();
        this.active = true;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public License getLicense() {
        return license;
    }
    
    public void setLicense(License license) {
        this.license = license;
    }
    
    public String getFingerprint() {
        return fingerprint;
    }
    
    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }
    
    public LocalDateTime getActivatedAt() {
        return activatedAt;
    }
    
    public void setActivatedAt(LocalDateTime activatedAt) {
        this.activatedAt = activatedAt;
    }
    
    public String getMachineInfo() {
        return machineInfo;
    }
    
    public void setMachineInfo(String machineInfo) {
        this.machineInfo = machineInfo;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
} 