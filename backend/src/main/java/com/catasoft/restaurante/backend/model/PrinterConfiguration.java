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

    // --- CAMPO DE VERSIONADO AÑADIDO ---
    @Version
    private Long version;
    // ------------------------------------

    @Column(nullable = false, unique = true, length = 50)
    private String role;

    @Column(nullable = false, length = 20)
    private String printerType;

    @Column(nullable = false, length = 100)
    private String printerTarget;

    // --- Getters y Setters (incluyendo el nuevo para version) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
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
}