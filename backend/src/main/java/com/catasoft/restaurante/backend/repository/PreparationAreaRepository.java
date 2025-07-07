package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.PreparationArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PreparationAreaRepository extends JpaRepository<PreparationArea, Long> {
    
    // Buscar por areaId
    Optional<PreparationArea> findByAreaId(String areaId);
    
    // Buscar por tipo
    List<PreparationArea> findByType(String type);
    
    // Buscar áreas activas ordenadas por orden
    List<PreparationArea> findByActiveTrueOrderByOrderIndexAsc();
    
    // Buscar todas las áreas ordenadas por orden
    List<PreparationArea> findAllByOrderByOrderIndexAsc();
    
    // Verificar si existe un areaId
    boolean existsByAreaId(String areaId);
    
    // Contar áreas activas
    long countByActiveTrue();
    
    // Buscar por nombre (búsqueda parcial)
    List<PreparationArea> findByNameContainingIgnoreCase(String name);
    
    // Buscar áreas por tipo y activas
    List<PreparationArea> findByTypeAndActiveTrueOrderByOrderIndexAsc(String type);
    
    // Obtener el siguiente orderIndex disponible
    @Query("SELECT COALESCE(MAX(p.orderIndex), 0) + 1 FROM PreparationArea p")
    Integer getNextOrderIndex();
} 