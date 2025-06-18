package com.catasoft.restaurante.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReporteVentasDTO {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private int numeroDeVentas;
    private BigDecimal totalRecaudado;
    private List<ProductoVendidoDTO> productosMasVendidos;

    // Getters y Setters
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    public int getNumeroDeVentas() { return numeroDeVentas; }
    public void setNumeroDeVentas(int numeroDeVentas) { this.numeroDeVentas = numeroDeVentas; }
    public BigDecimal getTotalRecaudado() { return totalRecaudado; }
    public void setTotalRecaudado(BigDecimal totalRecaudado) { this.totalRecaudado = totalRecaudado; }
    public List<ProductoVendidoDTO> getProductosMasVendidos() { return productosMasVendidos; }
    public void setProductosMasVendidos(List<ProductoVendidoDTO> productosMasVendidos) { this.productosMasVendidos = productosMasVendidos; }
}