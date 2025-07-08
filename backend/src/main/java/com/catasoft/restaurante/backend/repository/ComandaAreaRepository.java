package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.ComandaArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComandaAreaRepository extends JpaRepository<ComandaArea, Long> {
    
    // Buscar por comanda
    List<ComandaArea> findByComandaId(Long comandaId);
    
    // Buscar por área
    List<ComandaArea> findByAreaId(String areaId);
    
    // Buscar por comanda y área
    Optional<ComandaArea> findByComandaIdAndAreaId(Long comandaId, String areaId);
    
    // Buscar por estado
    List<ComandaArea> findByStatus(ComandaArea.EstadoComandaArea status);
    
    // Buscar por área y estado
    List<ComandaArea> findByAreaIdAndStatus(String areaId, ComandaArea.EstadoComandaArea status);
    
    // Buscar por usuario asignado
    List<ComandaArea> findByAssignedTo(String assignedTo);
    
    // Buscar por área y usuario asignado
    List<ComandaArea> findByAreaIdAndAssignedTo(String areaId, String assignedTo);
    
    // Buscar comandas pendientes de un área
    List<ComandaArea> findByAreaIdAndStatusOrderByCreatedAtAsc(String areaId, ComandaArea.EstadoComandaArea status);
    
    // Buscar comandas en progreso de un área
    List<ComandaArea> findByAreaIdAndStatusInOrderByStartedAtAsc(String areaId, List<ComandaArea.EstadoComandaArea> statuses);
    
    // Buscar comandas listas de un área
    List<ComandaArea> findByAreaIdAndStatusOrderByCompletedAtDesc(String areaId, ComandaArea.EstadoComandaArea status);
    
    // Contar comandas por área y estado
    long countByAreaIdAndStatus(String areaId, ComandaArea.EstadoComandaArea status);
    
    // Buscar comandas creadas después de una fecha
    List<ComandaArea> findByCreatedAtAfter(LocalDateTime date);
    
    // Buscar comandas por área creadas después de una fecha
    List<ComandaArea> findByAreaIdAndCreatedAtAfter(String areaId, LocalDateTime date);
    
    // Buscar comandas que no están entregadas
    List<ComandaArea> findByStatusNot(ComandaArea.EstadoComandaArea status);
    
    // Buscar comandas por área que no están entregadas
    List<ComandaArea> findByAreaIdAndStatusNot(String areaId, ComandaArea.EstadoComandaArea status);
    
    // Buscar comandas por área que no están en ciertos estados
    List<ComandaArea> findByAreaIdAndStatusNotIn(String areaId, List<ComandaArea.EstadoComandaArea> statuses);
    
    // Verificar si existe comanda para comanda y área
    boolean existsByComandaIdAndAreaId(Long comandaId, String areaId);
    
    // Obtener estadísticas por área
    @Query("SELECT ca.areaId, ca.status, COUNT(ca) FROM ComandaArea ca WHERE ca.areaId = :areaId GROUP BY ca.areaId, ca.status")
    List<Object[]> getStatisticsByArea(String areaId);
    
    // Obtener comandas con items
    @Query("SELECT ca FROM ComandaArea ca LEFT JOIN FETCH ca.items WHERE ca.areaId = :areaId AND ca.status = :status")
    List<ComandaArea> findByAreaIdAndStatusWithItems(String areaId, ComandaArea.EstadoComandaArea status);
} 