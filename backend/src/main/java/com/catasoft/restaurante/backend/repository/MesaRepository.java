package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {
    // Métodos CRUD básicos ya están incluidos.
}