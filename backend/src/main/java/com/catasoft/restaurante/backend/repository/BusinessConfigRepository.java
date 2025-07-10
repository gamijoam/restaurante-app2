package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.BusinessConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessConfigRepository extends JpaRepository<BusinessConfig, Long> {
    
    // Obtener la configuración activa del negocio
    Optional<BusinessConfig> findByIsActiveTrue();
    
    // Verificar si existe una configuración activa
    boolean existsByIsActiveTrue();
    
    // Obtener la primera configuración (para casos donde no hay configuración activa)
    Optional<BusinessConfig> findFirstByOrderByIdAsc();
} 