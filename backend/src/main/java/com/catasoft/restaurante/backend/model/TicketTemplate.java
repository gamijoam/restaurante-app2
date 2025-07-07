package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ticket_templates")
public class TicketTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "area_id", nullable = false)
    private String areaId;
    
    @Column(name = "is_default")
    private Boolean isDefault = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relación con los bloques del ticket
    @OneToMany(mappedBy = "ticketTemplate", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TicketBlock> blocks;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public TicketTemplate() {}
    
    public TicketTemplate(String name, String areaId, Boolean isDefault) {
        this.name = name;
        this.areaId = areaId;
        this.isDefault = isDefault;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getAreaId() {
        return areaId;
    }
    
    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }
    
    public Boolean getIsDefault() {
        return isDefault;
    }
    
    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
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
    
    public List<TicketBlock> getBlocks() {
        return blocks;
    }
    
    public void setBlocks(List<TicketBlock> blocks) {
        this.blocks = blocks;
    }
} 