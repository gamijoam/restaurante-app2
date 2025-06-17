package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Por ahora lo dejamos vacío.
    // Spring Data JPA nos da los métodos CRUD básicos.
    // Más adelante, si necesitamos búsquedas personalizadas (ej: buscar por nombre),
    // las definiremos aquí.
}