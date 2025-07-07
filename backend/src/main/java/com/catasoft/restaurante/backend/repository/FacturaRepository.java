package com.catasoft.restaurante.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.catasoft.restaurante.backend.model.Factura;

@Repository
public interface FacturaRepository extends JpaRepository<Factura,Long>{
    List<Factura> findByFechaEmisionBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    Factura findByComanda_Id(Long comandaId);
} 