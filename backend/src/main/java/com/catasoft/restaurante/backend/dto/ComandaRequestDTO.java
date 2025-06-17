package com.catasoft.restaurante.backend.dto;

import java.util.List;

public class ComandaRequestDTO {
    private Long mesaId;
    private List<ItemRequestDTO> items;

    // Getters y Setters
    public Long getMesaId() { return mesaId; }
    public void setMesaId(Long mesaId) { this.mesaId = mesaId; }
    public List<ItemRequestDTO> getItems() { return items; }
    public void setItems(List<ItemRequestDTO> items) { this.items = items; }
}