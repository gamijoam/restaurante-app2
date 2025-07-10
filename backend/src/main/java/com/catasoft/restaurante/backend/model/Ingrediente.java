package com.catasoft.restaurante.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "ingredientes", uniqueConstraints = {@UniqueConstraint(columnNames = {"nombre"})})
public class Ingrediente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String nombre;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Double stock;

    @NotBlank
    @Column(name = "unidad_medida", nullable = false, length = 20)
    @JsonProperty("unidad")
    private String unidad;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "precio_unitario", nullable = false)
    @JsonProperty("precio_unitario")
    private Double precioUnitario;

    @Column(nullable = false)
    private Boolean activo = true;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Double getStock() { return stock; }
    public void setStock(Double stock) { this.stock = stock; }
    @JsonProperty("unidad")
    public String getUnidad() { return unidad; }
    @JsonProperty("unidad")
    public void setUnidad(String unidad) { this.unidad = unidad; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    @JsonProperty("precio_unitario")
    public Double getPrecioUnitario() { return precioUnitario; }
    @JsonProperty("precio_unitario")
    public void setPrecioUnitario(Double precioUnitario) { this.precioUnitario = precioUnitario; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
