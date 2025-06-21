package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.service.ComandaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize; // <-- Añadir importación
import com.catasoft.restaurante.backend.dto.ItemRequestDTO;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/comandas")
public class ComandaController {

    private final ComandaService comandaService;

    public ComandaController(ComandaService comandaService) {
        this.comandaService = comandaService;
    }

    @PostMapping("/{id}/items")
@PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO')")
public ResponseEntity<ComandaResponseDTO> agregarItemsAComanda(
        @PathVariable Long id,
        @RequestBody List<ItemRequestDTO> items) {
    return ResponseEntity.ok(comandaService.agregarItemsAComanda(id, items));
}
    @PostMapping
    public ResponseEntity<ComandaResponseDTO> createComanda(@RequestBody ComandaRequestDTO request) {
        ComandaResponseDTO nuevaComanda = comandaService.crearComanda(request);
        return new ResponseEntity<>(nuevaComanda, HttpStatus.CREATED);
    }

    @GetMapping
public ResponseEntity<List<ComandaResponseDTO>> getAllComandas(@RequestParam(required = false) List<String> estados) {
    // Si no se provee el parámetro "estados" o está vacío, devolvemos todas las comandas.
    if (estados == null || estados.isEmpty()) {
        return ResponseEntity.ok(comandaService.getAllComandas());
    }

    // Si se provee, filtramos por esos estados.
    try {
        List<EstadoComanda> estadosEnum = estados.stream()
                .map(String::toUpperCase)
                .map(EstadoComanda::valueOf)
                .collect(Collectors.toList());
        return ResponseEntity.ok(comandaService.getComandasByEstados(estadosEnum));
    } catch (IllegalArgumentException e) {
        // Si se provee un estado inválido, devolvemos un error de "Bad Request".
        return ResponseEntity.badRequest().build();
    }
}

    @GetMapping("/{id}")
    public ResponseEntity<ComandaResponseDTO> getComandaById(@PathVariable Long id) {
        return ResponseEntity.ok(comandaService.getComandaById(id));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<ComandaResponseDTO> updateEstadoComanda(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(comandaService.updateEstadoComanda(id, payload));
    }
}