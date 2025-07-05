package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Ingrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredienteRepository extends JpaRepository<Ingrediente, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
}
