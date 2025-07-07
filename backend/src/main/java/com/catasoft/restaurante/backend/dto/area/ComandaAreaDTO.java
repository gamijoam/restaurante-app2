package com.catasoft.restaurante.backend.dto.area;

import java.time.LocalDateTime;
import java.util.List;

public class ComandaAreaDTO {
    private Long id;
    private Long comandaId;
    private String areaId;
    private String status;
    private String assignedTo;
    private String notes;
    private Integer estimatedTime;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ComandaAreaItemDTO> items;
    // Getters y setters
    // ...
} 