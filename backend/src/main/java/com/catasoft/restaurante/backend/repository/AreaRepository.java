package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {
    
    Optional<Area> findByAreaId(String areaId);
    
    boolean existsByAreaId(String areaId);
} 