package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.Ingrediente;
import com.catasoft.restaurante.backend.service.IngredienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/ingredientes")
public class IngredienteController {
    private final IngredienteService ingredienteService;

    public IngredienteController(IngredienteService ingredienteService) {
        this.ingredienteService = ingredienteService;
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENTE')")
    public List<Ingrediente> getAll() {
        return ingredienteService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Ingrediente> getById(@PathVariable Long id) {
        return ingredienteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Ingrediente> create(@Valid @RequestBody Ingrediente ingrediente) {
        if (ingredienteService.existsByNombre(ingrediente.getNombre())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ingredienteService.save(ingrediente));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Ingrediente> update(@PathVariable Long id, @Valid @RequestBody Ingrediente ingrediente) {
        return ingredienteService.findById(id)
                .map(existing -> {
                    existing.setNombre(ingrediente.getNombre());
                    existing.setStock(ingrediente.getStock());
                    existing.setUnidad(ingrediente.getUnidad());
                    existing.setDescripcion(ingrediente.getDescripcion());
                    return ResponseEntity.ok(ingredienteService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!ingredienteService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        ingredienteService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
