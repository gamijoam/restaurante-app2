package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dolar_rates")
public class DolarRate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha", nullable = false, unique = true)
    private LocalDate fecha;
    
    @Column(name = "precio_dolar", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioDolar;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Constructor por defecto
    public DolarRate() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Constructor con parámetros
    public DolarRate(LocalDate fecha, BigDecimal precioDolar) {
        this();
        this.fecha = fecha;
        this.precioDolar = precioDolar;
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
    
    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
} 