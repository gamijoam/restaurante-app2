package com.catasoft.restaurante.backend.dto;

public class ProductoVendidoDTO {
    private Long productoId;
    private String nombreProducto;
    private int cantidadTotal;
    private java.math.BigDecimal precioUnitario;
    private java.math.BigDecimal totalGenerado;

    // Getters y Setters
    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public int getCantidadTotal() { return cantidadTotal; }
    public void setCantidadTotal(int cantidadTotal) { this.cantidadTotal = cantidadTotal; }
    public java.math.BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(java.math.BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
    public java.math.BigDecimal getTotalGenerado() { return totalGenerado; }
    public void setTotalGenerado(java.math.BigDecimal totalGenerado) { this.totalGenerado = totalGenerado; }
}