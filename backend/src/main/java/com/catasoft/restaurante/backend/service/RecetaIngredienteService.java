package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.repository.RecetaIngredienteRepository;
import org.springframework.stereotype.Service;


import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RecetaIngredienteService {
    private final RecetaIngredienteRepository recetaIngredienteRepository;

    public RecetaIngredienteService(RecetaIngredienteRepository recetaIngredienteRepository) {
        this.recetaIngredienteRepository = recetaIngredienteRepository;
    }

    public List<RecetaIngrediente> findByProducto(Producto producto) {
        return recetaIngredienteRepository.findByProducto(producto);
    }

    public RecetaIngrediente save(RecetaIngrediente recetaIngrediente) {
        return recetaIngredienteRepository.save(recetaIngrediente);
    }

    @Transactional
    public void deleteByProducto(Producto producto) {
        recetaIngredienteRepository.deleteByProducto(producto);
    }
}
