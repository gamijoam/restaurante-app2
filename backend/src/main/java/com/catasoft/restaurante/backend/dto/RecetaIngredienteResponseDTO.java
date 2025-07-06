package com.catasoft.restaurante.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// DTO de respuesta que incluye el nombre del ingrediente
@JsonIgnoreProperties(ignoreUnknown = true)
public class RecetaIngredienteResponseDTO {
    private Long id;
    private Long ingredienteId;
    private String ingredienteNombre;
    private Double cantidad;
    private String unidad;

    // Constructor
    public RecetaIngredienteResponseDTO(Long id, Long ingredienteId, String ingredienteNombre, Double cantidad, String unidad) {
        this.id = id;
        this.ingredienteId = ingredienteId;
        this.ingredienteNombre = ingredienteNombre;
        this.cantidad = cantidad;
        this.unidad = unidad;
    }

    // Constructor por defecto
    public RecetaIngredienteResponseDTO() {
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getIngredienteId() { return ingredienteId; }
    public void setIngredienteId(Long ingredienteId) { this.ingredienteId = ingredienteId; }
    
    public String getIngredienteNombre() { return ingredienteNombre; }
    public void setIngredienteNombre(String ingredienteNombre) { this.ingredienteNombre = ingredienteNombre; }
    
    public Double getCantidad() { return cantidad; }
    public void setCantidad(Double cantidad) { this.cantidad = cantidad; }
    
    public String getUnidad() { return unidad; }
    public void setUnidad(String unidad) { this.unidad = unidad; }
} 