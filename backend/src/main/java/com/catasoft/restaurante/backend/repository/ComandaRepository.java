package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
@Repository
public interface ComandaRepository extends JpaRepository<Comanda, Long> {
    // Este método buscará todas las comandas por un estado específico (PAGADA)
    // y cuya fecha de creación esté entre dos momentos dados.
    List<Comanda> findByEstadoAndFechaHoraCreacionBetween(EstadoComanda estado, LocalDateTime start, LocalDateTime end);
    List<Comanda> findByEstado(EstadoComanda estado);
    List<Comanda> findByEstadoIn(Collection<EstadoComanda> estados);
    Optional<Comanda> findFirstByMesaIdAndEstadoOrderByFechaHoraCreacionDesc(Long mesaId, EstadoComanda estado);
    // --- MÉTODO AÑADIDO: LA SOLUCIÓN DEFINITIVA ---
    @Query("SELECT c FROM Comanda c JOIN FETCH c.mesa JOIN FETCH c.items i JOIN FETCH i.producto WHERE c.id = :comandaId")
    Optional<Comanda> findByIdWithDetails(@Param("comandaId") Long comandaId);
    // ---------------------------------------------
}