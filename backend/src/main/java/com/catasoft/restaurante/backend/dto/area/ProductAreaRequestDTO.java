package com.catasoft.restaurante.backend.dto.area;

public class ProductAreaRequestDTO {
    private Long productId;
    private String areaId;
    private Integer preparationTime;

    // Constructor vacío
    public ProductAreaRequestDTO() {}

    // Constructor completo
    public ProductAreaRequestDTO(Long productId, String areaId, Integer preparationTime) {
        this.productId = productId;
        this.areaId = areaId;
        this.preparationTime = preparationTime;
    }

    // Getters y setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getAreaId() {
        return areaId;
    }

    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }

    public Integer getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(Integer preparationTime) {
        this.preparationTime = preparationTime;
    }
} 