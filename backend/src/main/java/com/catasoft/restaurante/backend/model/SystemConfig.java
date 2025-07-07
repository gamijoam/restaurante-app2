package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "system_config")
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String clave;

    @Column(nullable = false)
    private String valor;

    public SystemConfig() {}
    public SystemConfig(String clave, String valor) {
        this.clave = clave;
        this.valor = valor;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }

    // Utilidad para obtener el valor como BigDecimal
    public BigDecimal getValorDecimal() {
        try {
            return new BigDecimal(valor);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
} 