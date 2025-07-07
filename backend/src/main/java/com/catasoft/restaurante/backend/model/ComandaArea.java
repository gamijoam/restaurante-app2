package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comanda_areas")
public class ComandaArea {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comanda_id", nullable = false)
    private Comanda comanda;
    
    @Column(name = "area_id", nullable = false, length = 50)
    private String areaId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EstadoComandaArea status = EstadoComandaArea.PENDING;
    
    @Column(name = "assigned_to", length = 100)
    private String assignedTo; // Usuario asignado a la comanda
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Notas específicas del área
    
    @Column(name = "estimated_time")
    private Integer estimatedTime; // Tiempo estimado en minutos
    
    @Column(name = "started_at")
    private LocalDateTime startedAt; // Cuándo se inició la preparación
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt; // Cuándo se completó la preparación
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "comandaArea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ComandaAreaItem> items = new ArrayList<>();
    
    // Enum para el estado de la comanda por área
    public enum EstadoComandaArea {
        PENDING,      // Pendiente
        IN_PROGRESS,  // En progreso
        READY,        // Lista
        DELIVERED     // Entregada
    }
    
    // Constructores
    public ComandaArea() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public ComandaArea(Comanda comanda, String areaId) {
        this();
        this.comanda = comanda;
        this.areaId = areaId;
    }
    
    // Métodos de negocio
    public void startPreparation() {
        this.status = EstadoComandaArea.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsReady() {
        this.status = EstadoComandaArea.READY;
        this.completedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsDelivered() {
        this.status = EstadoComandaArea.DELIVERED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean isAllItemsReady() {
        return items.stream().allMatch(item -> 
            item.getStatus() == ComandaAreaItem.EstadoItem.READY);
    }
    
    public int getTotalItems() {
        return items.size();
    }
    
    public int getReadyItems() {
        return (int) items.stream()
            .filter(item -> item.getStatus() == ComandaAreaItem.EstadoItem.READY)
            .count();
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Comanda getComanda() {
        return comanda;
    }
    
    public void setComanda(Comanda comanda) {
        this.comanda = comanda;
    }
    
    public String getAreaId() {
        return areaId;
    }
    
    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }
    
    public EstadoComandaArea getStatus() {
        return status;
    }
    
    public void setStatus(EstadoComandaArea status) {
        this.status = status;
    }
    
    public String getAssignedTo() {
        return assignedTo;
    }
    
    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Integer getEstimatedTime() {
        return estimatedTime;
    }
    
    public void setEstimatedTime(Integer estimatedTime) {
        this.estimatedTime = estimatedTime;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
    
    public List<ComandaAreaItem> getItems() {
        return items;
    }
    
    public void setItems(List<ComandaAreaItem> items) {
        this.items = items;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 