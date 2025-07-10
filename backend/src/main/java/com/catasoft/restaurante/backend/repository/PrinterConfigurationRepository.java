package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.PrinterConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrinterConfigurationRepository extends JpaRepository<PrinterConfiguration, Long> {

    // Método personalizado para buscar una configuración por su rol
    Optional<PrinterConfiguration> findByRole(String role);
    Optional<PrinterConfiguration> findByAreaId(String areaId);
}