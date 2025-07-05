package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.repository.ProductoRepository;
import com.catasoft.restaurante.backend.service.RecetaIngredienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/recetas")
public class RecetaIngredienteController {
    private final RecetaIngredienteService recetaIngredienteService;
    private final ProductoRepository productoRepository;

    public RecetaIngredienteController(RecetaIngredienteService recetaIngredienteService, ProductoRepository productoRepository) {
        this.recetaIngredienteService = recetaIngredienteService;
        this.productoRepository = productoRepository;
    }

    @GetMapping("/{productoId}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<List<RecetaIngrediente>> getByProducto(@PathVariable Long productoId) {
        return productoRepository.findById(productoId)
                .map(producto -> ResponseEntity.ok(recetaIngredienteService.findByProducto(producto)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{productoId}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<RecetaIngrediente> addIngredienteToReceta(@PathVariable Long productoId, @Valid @RequestBody RecetaIngrediente recetaIngrediente) {
        return productoRepository.findById(productoId)
                .map(producto -> {
                    recetaIngrediente.setProducto(producto);
                    return ResponseEntity.ok(recetaIngredienteService.save(recetaIngrediente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{productoId}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> deleteReceta(@PathVariable Long productoId) {
        if (productoRepository.existsById(productoId)) {
            Producto producto = productoRepository.findById(productoId).get();
            recetaIngredienteService.deleteByProducto(producto);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
