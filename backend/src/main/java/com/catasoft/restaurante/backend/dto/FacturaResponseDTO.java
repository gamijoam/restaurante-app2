package com.catasoft.restaurante.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FacturaResponseDTO {

    private Long id;
    private Long comandaId;
    private Integer numeroMesa;
    private BigDecimal total;
    private BigDecimal impuesto;
    private LocalDateTime fechaEmision;

    // El campo 'items' ahora está DENTRO de la clase, junto a los demás.
    private List<ComandaItemResponseDTO> items;

    // Getters y Setters para todos los campos
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getComandaId() { return comandaId; }
    public void setComandaId(Long comandaId) { this.comandaId = comandaId; }
    public Integer getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(Integer numeroMesa) { this.numeroMesa = numeroMesa; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public BigDecimal getImpuesto() { return impuesto; }
    public void setImpuesto(BigDecimal impuesto) { this.impuesto = impuesto; }
    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }

    // Getters y Setters para 'items'
    public List<ComandaItemResponseDTO> getItems() { return items; } // Corregido para que no se llame a sí mismo
    public void setItems(List<ComandaItemResponseDTO> items) { this.items = items; }
}