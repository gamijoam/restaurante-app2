package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {
    // Métodos CRUD básicos ya están incluidos.
    
    Optional<Mesa> findByNumero(Integer numero);
}