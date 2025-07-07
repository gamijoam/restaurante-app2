package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
    Optional<SystemConfig> findByClave(String clave);
} 