package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.Ingrediente;
import com.catasoft.restaurante.backend.repository.IngredienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IngredienteService {
    private final IngredienteRepository ingredienteRepository;

    public IngredienteService(IngredienteRepository ingredienteRepository) {
        this.ingredienteRepository = ingredienteRepository;
    }

    public List<Ingrediente> findAll() {
        return ingredienteRepository.findAll();
    }

    public Optional<Ingrediente> findById(Long id) {
        return ingredienteRepository.findById(id);
    }

    public Ingrediente save(Ingrediente ingrediente) {
        return ingredienteRepository.save(ingrediente);
    }

    public void deleteById(Long id) {
        ingredienteRepository.deleteById(id);
    }

    public boolean existsByNombre(String nombre) {
        return ingredienteRepository.existsByNombreIgnoreCase(nombre);
    }
}
