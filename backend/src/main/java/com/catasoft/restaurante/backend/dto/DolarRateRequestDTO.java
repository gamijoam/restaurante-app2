package com.catasoft.restaurante.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DolarRateRequestDTO {
    private LocalDate fecha;
    private BigDecimal precioDolar;
    
    // Constructor por defecto
    public DolarRateRequestDTO() {}
    
    // Constructor con parámetros
    public DolarRateRequestDTO(LocalDate fecha, BigDecimal precioDolar) {
        this.fecha = fecha;
        this.precioDolar = precioDolar;
    }
    
    // Getters y Setters
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
} 