package com.catasoft.restaurante.backend.dto.area;

public class PreparationAreaRequestDTO {
    private String areaId;
    private String name;
    private String type;
    private String description;
    private boolean active;
    private int orderIndex;

    // Constructor vacío
    public PreparationAreaRequestDTO() {}

    // Constructor completo
    public PreparationAreaRequestDTO(String areaId, String name, String type, String description, 
                                   boolean active, int orderIndex) {
        this.areaId = areaId;
        this.name = name;
        this.type = type;
        this.description = description;
        this.active = active;
        this.orderIndex = orderIndex;
    }

    // Getters y setters
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
} 