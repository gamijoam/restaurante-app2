package com.catasoft.restaurante.backend.model;

import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "mesas")
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer numero;

    @Column(nullable = false)
    private Integer capacidad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoMesa estado;

    // --- Nuevos campos para el mapa visual ---
    @Column(name = "posicion_x", nullable = true)
    private Integer posicionX;

    @Column(name = "posicion_y", nullable = true)
    private Integer posicionY;

    @Column(nullable = true)
    private String nombre; // Nombre descriptivo (ej: "Mesa del Rincón", "Mesa VIP")

    @Column(nullable = false)
    private Boolean activo = true;

    // --- Constructores ---

    public Mesa() {
    }

    public Mesa(Integer numero, Integer capacidad, EstadoMesa estado) {
        this.numero = numero;
        this.capacidad = capacidad;
        this.estado = estado;
    }

    public Mesa(Integer numero, Integer capacidad, EstadoMesa estado, Integer posicionX, Integer posicionY, String nombre) {
        this.numero = numero;
        this.capacidad = capacidad;
        this.estado = estado;
        this.posicionX = posicionX;
        this.posicionY = posicionY;
        this.nombre = nombre;
    }

    // --- Getters y Setters ---

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

    public Boolean getActivo() {
        return activo;
    }
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}