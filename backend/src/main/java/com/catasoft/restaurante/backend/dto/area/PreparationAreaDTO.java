package com.catasoft.restaurante.backend.dto.area;

import java.time.LocalDateTime;

public class PreparationAreaDTO {
    private Long id;
    private String areaId;
    private String name;
    private String type;
    private String description;
    private boolean active;
    private int orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor vacío
    public PreparationAreaDTO() {}

    // Constructor completo
    public PreparationAreaDTO(Long id, String areaId, String name, String type, String description, 
                            boolean active, int orderIndex, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.areaId = areaId;
        this.name = name;
        this.type = type;
        this.description = description;
        this.active = active;
        this.orderIndex = orderIndex;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters y setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAreaId() {
        return areaId;
    }

    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
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