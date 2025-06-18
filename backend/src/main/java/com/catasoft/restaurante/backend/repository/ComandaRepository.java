package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComandaRepository extends JpaRepository<Comanda, Long> {
    // Este método buscará todas las comandas por un estado específico (PAGADA)
    // y cuya fecha de creación esté entre dos momentos dados.
    List<Comanda> findByEstadoAndFechaHoraCreacionBetween(EstadoComanda estado, LocalDateTime start, LocalDateTime end);
}