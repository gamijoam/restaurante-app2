package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "comanda_area_items")
public class ComandaAreaItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comanda_area_id", nullable = false)
    private ComandaArea comandaArea;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Producto producto;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Notas específicas del item
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EstadoItem status = EstadoItem.PENDING;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Enum para el estado del item
    public enum EstadoItem {
        PENDING,      // Pendiente
        IN_PROGRESS,  // En progreso
        READY,        // Listo
        DELIVERED     // Entregado
    }
    
    // Constructores
    public ComandaAreaItem() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public ComandaAreaItem(ComandaArea comandaArea, Producto producto, Integer quantity, BigDecimal unitPrice) {
        this();
        this.comandaArea = comandaArea;
        this.producto = producto;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
    
    // Métodos de negocio
    public void startPreparation() {
        this.status = EstadoItem.IN_PROGRESS;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsReady() {
        this.status = EstadoItem.READY;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsDelivered() {
        this.status = EstadoItem.DELIVERED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public BigDecimal getTotalPrice() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public ComandaArea getComandaArea() {
        return comandaArea;
    }
    
    public void setComandaArea(ComandaArea comandaArea) {
        this.comandaArea = comandaArea;
    }
    
    public Producto getProducto() {
        return producto;
    }
    
    public void setProducto(Producto producto) {
        this.producto = producto;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public EstadoItem getStatus() {
        return status;
    }
    
    public void setStatus(EstadoItem status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 