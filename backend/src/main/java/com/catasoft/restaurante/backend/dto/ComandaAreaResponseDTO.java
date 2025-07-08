package com.catasoft.restaurante.backend.dto;

import java.util.List;

public class ComandaAreaResponseDTO {
    private Long id;
    private Long comandaId;
    private Long areaId;
    private String areaNombre;
    private Long mesaId;
    private String estado;
    private String fechaCreacion;
    private List<ComandaAreaItemDTO> items;

    // Constructor
    public ComandaAreaResponseDTO() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getComandaId() {
        return comandaId;
    }

    public void setComandaId(Long comandaId) {
        this.comandaId = comandaId;
    }

    public Long getAreaId() {
        return areaId;
    }

    public void setAreaId(Long areaId) {
        this.areaId = areaId;
    }

    public String getAreaNombre() {
        return areaNombre;
    }

    public void setAreaNombre(String areaNombre) {
        this.areaNombre = areaNombre;
    }

    public Long getMesaId() {
        return mesaId;
    }

    public void setMesaId(Long mesaId) {
        this.mesaId = mesaId;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(String fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<ComandaAreaItemDTO> getItems() {
        return items;
    }

    public void setItems(List<ComandaAreaItemDTO> items) {
        this.items = items;
    }

    // Clase interna para los items
    public static class ComandaAreaItemDTO {
        private Long id;
        private Long productoId;
        private String productoNombre;
        private Integer cantidad;
        private String observaciones;

        // Constructor
        public ComandaAreaItemDTO() {}

        // Getters y Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getProductoId() {
            return productoId;
        }

        public void setProductoId(Long productoId) {
            this.productoId = productoId;
        }

        public String getProductoNombre() {
            return productoNombre;
        }

        public void setProductoNombre(String productoNombre) {
            this.productoNombre = productoNombre;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }

        public String getObservaciones() {
            return observaciones;
        }

        public void setObservaciones(String observaciones) {
            this.observaciones = observaciones;
        }
    }
} 