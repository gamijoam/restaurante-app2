package com.catasoft.restaurante.backend.dto.area;

import com.catasoft.restaurante.backend.model.PreparationAreaType;
import java.time.LocalDateTime;

public class PreparationAreaDTO {
    private Long id;
    private String areaId;
    private String name;
    private PreparationAreaType type;
    private String description;
    private boolean active;
    private int orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters y setters
    // ...

    // Constructor vacío y completo
    // ...
} 