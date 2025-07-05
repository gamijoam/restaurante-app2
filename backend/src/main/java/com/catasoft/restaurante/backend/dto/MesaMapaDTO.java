package com.catasoft.restaurante.backend.dto;

import com.catasoft.restaurante.backend.model.enums.EstadoMesa;

public class MesaMapaDTO {
    private Long id;
    private Integer numero;
    private Integer capacidad;
    private EstadoMesa estado;
    private Integer posicionX;
    private Integer posicionY;
    private String nombre;
    private String colorEstado; // Color para el frontend
    private String estadoTexto; // Texto descriptivo del estado

    // Constructor
    public MesaMapaDTO() {}

    public MesaMapaDTO(Long id, Integer numero, Integer capacidad, EstadoMesa estado, 
                      Integer posicionX, Integer posicionY, String nombre) {
        this.id = id;
        this.numero = numero;
        this.capacidad = capacidad;
        this.estado = estado;
        this.posicionX = posicionX;
        this.posicionY = posicionY;
        this.nombre = nombre;
        this.colorEstado = getColorByEstado(estado);
        this.estadoTexto = getTextoByEstado(estado);
    }

    // Métodos para determinar color y texto según estado
    private String getColorByEstado(EstadoMesa estado) {
        switch (estado) {
            case LIBRE:
                return "#4CAF50"; // Verde
            case OCUPADA:
                return "#FF9800"; // Naranja
            case RESERVADA:
                return "#2196F3"; // Azul
            case MANTENIMIENTO:
                return "#F44336"; // Rojo
            default:
                return "#9E9E9E"; // Gris
        }
    }

    private String getTextoByEstado(EstadoMesa estado) {
        switch (estado) {
            case LIBRE:
                return "Libre";
            case OCUPADA:
                return "Ocupada";
            case RESERVADA:
                return "Reservada";
            case MANTENIMIENTO:
                return "Mantenimiento";
            default:
                return "Desconocido";
        }
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public EstadoMesa getEstado() {
        return estado;
    }

    public void setEstado(EstadoMesa estado) {
        this.estado = estado;
        this.colorEstado = getColorByEstado(estado);
        this.estadoTexto = getTextoByEstado(estado);
    }

    public Integer getPosicionX() {
        return posicionX;
    }

    public void setPosicionX(Integer posicionX) {
        this.posicionX = posicionX;
    }

    public Integer getPosicionY() {
        return posicionY;
    }

    public void setPosicionY(Integer posicionY) {
        this.posicionY = posicionY;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getColorEstado() {
        return colorEstado;
    }

    public void setColorEstado(String colorEstado) {
        this.colorEstado = colorEstado;
    }

    public String getEstadoTexto() {
        return estadoTexto;
    }

    public void setEstadoTexto(String estadoTexto) {
        this.estadoTexto = estadoTexto;
    }
} 