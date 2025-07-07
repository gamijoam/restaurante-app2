package com.catasoft.restaurante.backend.dto;

public class ItemRequestDTO {
    private Long productoId;
    private Integer cantidad;
    private Long itemPrincipalId; // Opcional, si es adicional de otro item

    // Getters y Setters
    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public Long getItemPrincipalId() { return itemPrincipalId; }
    public void setItemPrincipalId(Long itemPrincipalId) { this.itemPrincipalId = itemPrincipalId; }
}