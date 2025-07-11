package com.catasoft.restaurante.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DolarRateDTO {
    private Long id;
    private LocalDate fecha;
    private BigDecimal precioDolar;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    // Constructor por defecto
    public DolarRateDTO() {}
    
    // Constructor con parámetros
    public DolarRateDTO(Long id, LocalDate fecha, BigDecimal precioDolar, Boolean activo, 
                       LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion) {
        this.id = id;
        this.fecha = fecha;
        this.precioDolar = precioDolar;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
    
    public BigDecimal getPrecioDolar() {
        return precioDolar;
    }
    
    public void setPrecioDolar(BigDecimal precioDolar) {
        this.precioDolar = precioDolar;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
} 