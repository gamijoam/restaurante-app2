package com.catasoft.restaurante.backend.dto;

import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ComandaResponseDTO {
    private Long id;
    private Integer numeroMesa;
    private List<ComandaItemResponseDTO> items;
    private EstadoComanda estado;
    private LocalDateTime fechaHoraCreacion;
    private BigDecimal total;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(Integer numeroMesa) { this.numeroMesa = numeroMesa; }
    public List<ComandaItemResponseDTO> getItems() { return items; }
    public void setItems(List<ComandaItemResponseDTO> items) { this.items = items; }
    public EstadoComanda getEstado() { return estado; }
    public void setEstado(EstadoComanda estado) { this.estado = estado; }
    public LocalDateTime getFechaHoraCreacion() { return fechaHoraCreacion; }
    public void setFechaHoraCreacion(LocalDateTime fechaHoraCreacion) { this.fechaHoraCreacion = fechaHoraCreacion; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public void setNombreMesa(String nombre) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setNombreMesa'");
    }
}