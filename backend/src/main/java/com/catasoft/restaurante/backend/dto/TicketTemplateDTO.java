package com.catasoft.restaurante.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TicketTemplateDTO {
    
    private Long id;
    private String name;
    private String area;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketBlockDTO> blocks;
    
    // Constructors
    public TicketTemplateDTO() {}
    
    public TicketTemplateDTO(String name, String area, Boolean isDefault) {
        this.name = name;
        this.area = area;
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
    
    public String getArea() {
        return area;
    }
    
    public void setArea(String area) {
        this.area = area;
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
    
    public List<TicketBlockDTO> getBlocks() {
        return blocks;
    }
    
    public void setBlocks(List<TicketBlockDTO> blocks) {
        this.blocks = blocks;
    }
} 