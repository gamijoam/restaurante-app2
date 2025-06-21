package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "facturas")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comanda_id", nullable = false)
    private Comanda comanda;

    @Column(nullable = false)
    private BigDecimal total;

    @Column(nullable = false)
    private BigDecimal impuesto; // Por ejemplo, el IVA

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaEmision;

    // Podríamos añadir más campos como datos del cliente, número de factura, etc.
    // Por ahora, lo mantenemos simple.

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Comanda getComanda() { return comanda; }
    public void setComanda(Comanda comanda) { this.comanda = comanda; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public BigDecimal getImpuesto() { return impuesto; }
    public void setImpuesto(BigDecimal impuesto) { this.impuesto = impuesto; }
    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }
}