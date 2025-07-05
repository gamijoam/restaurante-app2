package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.model.Ingrediente;
import com.catasoft.restaurante.backend.repository.ProductoRepository;
import com.catasoft.restaurante.backend.repository.IngredienteRepository;
import com.catasoft.restaurante.backend.service.RecetaIngredienteService;
import com.catasoft.restaurante.backend.dto.RecetaIngredienteDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.ArrayList;


@RestController
@RequestMapping("/api/v1/recetas")
public class RecetaIngredienteController {
    private final RecetaIngredienteService recetaIngredienteService;
    private final ProductoRepository productoRepository;
    private final IngredienteRepository ingredienteRepository;

    public RecetaIngredienteController(RecetaIngredienteService recetaIngredienteService, ProductoRepository productoRepository, IngredienteRepository ingredienteRepository) {
        this.recetaIngredienteService = recetaIngredienteService;
        this.productoRepository = productoRepository;
        this.ingredienteRepository = ingredienteRepository;
    }

    @GetMapping("/producto/{productoId}")
    @PreAuthorize("hasRole('GERENTE')")
    public List<RecetaIngrediente> getRecetasByProducto(@PathVariable Long productoId) {
        return recetaIngredienteService.findByProductoId(productoId);
    }

    @PostMapping("/producto/{productoId}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> actualizarRecetaProducto(
            @PathVariable Long productoId,
            @Valid @RequestBody List<RecetaIngredienteDTO> recetasDTO) {
        
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // Convertir DTOs a entidades
        List<RecetaIngrediente> recetas = new ArrayList<>();
        for (RecetaIngredienteDTO dto : recetasDTO) {
            Ingrediente ingrediente = ingredienteRepository.findById(dto.getIngredienteId())
                    .orElseThrow(() -> new RuntimeException("Ingrediente no encontrado con id: " + dto.getIngredienteId()));
            
            RecetaIngrediente receta = new RecetaIngrediente();
            receta.setProducto(producto);
            receta.setIngrediente(ingrediente);
            receta.setCantidad(dto.getCantidad());
            receta.setUnidad(dto.getUnidad());
            
            recetas.add(receta);
        }
        
        recetaIngredienteService.actualizarRecetaProducto(productoId, recetas);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> deleteReceta(@PathVariable Long id) {
        if (!recetaIngredienteService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        recetaIngredienteService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
