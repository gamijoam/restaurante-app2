package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.DolarRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DolarRateRepository extends JpaRepository<DolarRate, Long> {
    
    /**
     * Busca el precio del dólar para una fecha específica
     */
    Optional<DolarRate> findByFechaAndActivoTrue(LocalDate fecha);
    
    /**
     * Busca el precio del dólar más reciente (último registrado)
     */
    @Query("SELECT d FROM DolarRate d WHERE d.activo = true ORDER BY d.fecha DESC")
    List<DolarRate> findLatestRates();
    
    /**
     * Busca el precio del dólar para hoy
     */
    @Query("SELECT d FROM DolarRate d WHERE d.fecha = :fecha AND d.activo = true")
    Optional<DolarRate> findByFecha(@Param("fecha") LocalDate fecha);
    
    /**
     * Busca todos los precios activos ordenados por fecha descendente
     */
    @Query("SELECT d FROM DolarRate d WHERE d.activo = true ORDER BY d.fecha DESC")
    List<DolarRate> findAllActiveOrderByFechaDesc();
    
    /**
     * Verifica si existe un precio para una fecha específica
     */
    boolean existsByFechaAndActivoTrue(LocalDate fecha);
} 