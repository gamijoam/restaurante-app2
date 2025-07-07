package com.catasoft.restaurante.backend.dto.area;

import java.time.LocalDateTime;

public class ComandaAreaItemDTO {
    private Long id;
    private Long comandaAreaId;
    private Long productId;
    private Integer quantity;
    private Double unitPrice;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Getters y setters
    // ...
} 