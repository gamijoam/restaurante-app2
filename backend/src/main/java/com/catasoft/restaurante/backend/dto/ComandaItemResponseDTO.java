package com.catasoft.restaurante.backend.dto;

import java.math.BigDecimal;

public class ComandaItemResponseDTO {
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private Long itemPrincipalId; // Opcional, si es adicional de otro item
    private boolean esNuevo;

    // Getters y Setters
    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    public String getProductoNombre() { return productoNombre; }
    public void setProductoNombre(String productoNombre) { this.productoNombre = productoNombre; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public Long getItemPrincipalId() { return itemPrincipalId; }
    public void setItemPrincipalId(Long itemPrincipalId) { this.itemPrincipalId = itemPrincipalId; }
    public boolean isEsNuevo() { return esNuevo; }
    public void setEsNuevo(boolean esNuevo) { this.esNuevo = esNuevo; }
}