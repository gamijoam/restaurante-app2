package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    List<Permission> findByActivoTrue();
    
    Optional<Permission> findByNombre(String nombre);
    
    boolean existsByNombre(String nombre);
} 