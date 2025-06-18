package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.service.ComandaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<ComandaResponseDTO> createComanda(@RequestBody ComandaRequestDTO request) {
        ComandaResponseDTO nuevaComanda = comandaService.crearComanda(request);
        return new ResponseEntity<>(nuevaComanda, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ComandaResponseDTO> getAllComandas(@RequestParam Optional<List<String>> estados) {
        // Esta es la lógica final y correcta para manejar el filtrado por estado(s)
        if (estados.isPresent() && !estados.get().isEmpty()) {
            try {
                List<EstadoComanda> estadosEnum = estados.get().stream()
                        .map(String::toUpperCase)
                        .map(EstadoComanda::valueOf)
                        .collect(Collectors.toList());

                return comandaService.getComandasByEstados(estadosEnum);

            } catch (IllegalArgumentException e) {
                // Si se provee un estado inválido, se devuelve una lista vacía.
                return List.of();
            }
        }
        // Si no se provee el parámetro "estados", se devuelven todas las comandas.
        return comandaService.getAllComandas();
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