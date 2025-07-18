package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.Ingrediente;
import com.catasoft.restaurante.backend.service.IngredienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/ingredientes")
public class IngredienteController {
    private final IngredienteService ingredienteService;

    public IngredienteController(IngredienteService ingredienteService) {
        this.ingredienteService = ingredienteService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'COCINERO')")
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

    // Endpoint para consultar el stock actual de un ingrediente
    @GetMapping("/{id}/stock")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Double> getStock(@PathVariable Long id) {
        return ingredienteService.findById(id)
                .map(ingrediente -> ResponseEntity.ok(ingrediente.getStock()))
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

    // Endpoint para ingresar stock a un ingrediente
    @PostMapping("/{id}/ingresar-stock")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Ingrediente> ingresarStock(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Ingrediente ingrediente = ingredienteService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado con id: " + id));
        Double cantidad = null;
        if (payload.get("cantidad") instanceof Number) {
            cantidad = ((Number) payload.get("cantidad")).doubleValue();
        } else if (payload.get("cantidad") instanceof String) {
            cantidad = Double.parseDouble((String) payload.get("cantidad"));
        }
        if (cantidad == null || cantidad <= 0) {
            return ResponseEntity.badRequest().build();
        }
        ingrediente.setStock(ingrediente.getStock() + cantidad);
        ingredienteService.save(ingrediente);
        return ResponseEntity.ok(ingrediente);
    }
}
