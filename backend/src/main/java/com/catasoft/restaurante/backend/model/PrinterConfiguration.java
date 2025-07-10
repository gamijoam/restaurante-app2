package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*; // Asegúrate de importar Version

@Entity
@Table(name = "printer_configurations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"role"})
})
public class PrinterConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(name = "nombre", nullable = false, unique = true, length = 50)
    private String role;

    @Column(name = "tipo", nullable = false, length = 20)
    private String printerType;

    @Column(name = "configuracion", nullable = false, length = 100)
    private String printerTarget;

    @Column(name = "area_id", nullable = true, length = 100)
    private String areaId;

    // --- Getters y Setters (incluyendo el nuevo para version) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPrinterType() {
        return printerType;
    }

    public void setPrinterType(String printerType) {
        this.printerType = printerType;
    }

    public String getPrinterTarget() {
        return printerTarget;
    }

    public void setPrinterTarget(String printerTarget) {
        this.printerTarget = printerTarget;
    }

    public String getAreaId() {
        return areaId;
    }

    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }
}