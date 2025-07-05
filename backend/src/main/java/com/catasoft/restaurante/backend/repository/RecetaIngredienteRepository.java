package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecetaIngredienteRepository extends JpaRepository<RecetaIngrediente, Long> {
    List<RecetaIngrediente> findByProducto(Producto producto);
    List<RecetaIngrediente> findByProductoId(Long productoId);
    void deleteByProducto(Producto producto);
    void deleteByProductoId(Long productoId);
}
