package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.repository.RecetaIngredienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RecetaIngredienteService {
    private final RecetaIngredienteRepository recetaIngredienteRepository;

    public RecetaIngredienteService(RecetaIngredienteRepository recetaIngredienteRepository) {
        this.recetaIngredienteRepository = recetaIngredienteRepository;
    }

    public List<RecetaIngrediente> findByProducto(Producto producto) {
        return recetaIngredienteRepository.findByProducto(producto);
    }

    public List<RecetaIngrediente> findByProductoId(Long productoId) {
        return recetaIngredienteRepository.findByProductoId(productoId);
    }

    public RecetaIngrediente save(RecetaIngrediente recetaIngrediente) {
        return recetaIngredienteRepository.save(recetaIngrediente);
    }

    public void deleteById(Long id) {
        recetaIngredienteRepository.deleteById(id);
    }

    public void deleteByProductoId(Long productoId) {
        recetaIngredienteRepository.deleteByProductoId(productoId);
    }

    public Optional<RecetaIngrediente> findById(Long id) {
        return recetaIngredienteRepository.findById(id);
    }

    @Transactional
    public void actualizarRecetaProducto(Long productoId, List<RecetaIngrediente> nuevasRecetas) {
        // Eliminar recetas existentes
        deleteByProductoId(productoId);
        
        // Guardar nuevas recetas
        for (RecetaIngrediente receta : nuevasRecetas) {
            save(receta);
        }
    }
}
