package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.ComandaAreaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComandaAreaItemRepository extends JpaRepository<ComandaAreaItem, Long> {
    
    // Buscar por comanda área
    List<ComandaAreaItem> findByComandaAreaId(Long comandaAreaId);
    
    // Buscar por producto
    List<ComandaAreaItem> findByProductoId(Long productoId);
    
    // Buscar por estado
    List<ComandaAreaItem> findByStatus(ComandaAreaItem.EstadoItem status);
    
    // Buscar por comanda área y estado
    List<ComandaAreaItem> findByComandaAreaIdAndStatus(Long comandaAreaId, ComandaAreaItem.EstadoItem status);
    
    // Buscar por producto y estado
    List<ComandaAreaItem> findByProductoIdAndStatus(Long productoId, ComandaAreaItem.EstadoItem status);
    
    // Contar items por comanda área
    long countByComandaAreaId(Long comandaAreaId);
    
    // Contar items por comanda área y estado
    long countByComandaAreaIdAndStatus(Long comandaAreaId, ComandaAreaItem.EstadoItem status);
    
    // Buscar items pendientes de una comanda área
    List<ComandaAreaItem> findByComandaAreaIdAndStatusOrderByCreatedAtAsc(Long comandaAreaId, ComandaAreaItem.EstadoItem status);
    
    // Buscar items en progreso de una comanda área
    List<ComandaAreaItem> findByComandaAreaIdAndStatusInOrderByUpdatedAtAsc(Long comandaAreaId, List<ComandaAreaItem.EstadoItem> statuses);
    
    // Buscar items listos de una comanda área
    List<ComandaAreaItem> findByComandaAreaIdAndStatusOrderByUpdatedAtDesc(Long comandaAreaId, ComandaAreaItem.EstadoItem status);
    
    // Verificar si todos los items de una comanda área están listos
    boolean existsByComandaAreaIdAndStatusNot(Long comandaAreaId, ComandaAreaItem.EstadoItem status);
} 