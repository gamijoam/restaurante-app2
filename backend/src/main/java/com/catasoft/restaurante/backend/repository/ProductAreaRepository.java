package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.ProductArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductAreaRepository extends JpaRepository<ProductArea, Long> {
    
    // Buscar por producto
    List<ProductArea> findByProductoId(Long productoId);
    
    // Buscar por área
    List<ProductArea> findByAreaId(String areaId);
    
    // Buscar por producto y área
    Optional<ProductArea> findByProductoIdAndAreaId(Long productoId, String areaId);
    
    // Verificar si existe la asociación
    boolean existsByProductoIdAndAreaId(Long productoId, String areaId);
    
    // Buscar productos de un área específica
    @Query("SELECT pa FROM ProductArea pa JOIN FETCH pa.producto WHERE pa.areaId = :areaId")
    List<ProductArea> findByAreaIdWithProduct(String areaId);
    
    // Buscar áreas de un producto específico
    @Query("SELECT pa FROM ProductArea pa WHERE pa.producto.id = :productoId")
    List<ProductArea> findByProductoIdWithArea(Long productoId);
    
    // Eliminar por producto y área
    void deleteByProductoIdAndAreaId(Long productoId, String areaId);
    
    // Contar productos por área
    long countByAreaId(String areaId);
    
    // Buscar productos con tiempo de preparación mayor a X minutos
    List<ProductArea> findByPreparationTimeGreaterThan(Integer minutes);
    
    // Buscar productos con tiempo de preparación entre X e Y minutos
    List<ProductArea> findByPreparationTimeBetween(Integer minMinutes, Integer maxMinutes);
} 