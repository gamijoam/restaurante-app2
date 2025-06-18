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
    public List<ComandaResponseDTO> getAllComandas(@RequestParam Optional<String> estado) {
        // --- LOGS DE DEPURACIÓN ---
        System.out.println("\n--- [BACKEND LOG] Se ha recibido una petición a /api/v1/comandas ---");

        if (estado.isPresent()) {
            System.out.println("--- [BACKEND LOG] El parámetro 'estado' está presente. Valor: " + estado.get());
            try {
                EstadoComanda estadoEnum = EstadoComanda.valueOf(estado.get().toUpperCase());
                System.out.println("--- [BACKEND LOG] El estado se ha convertido a Enum correctamente: " + estadoEnum);
                System.out.println("--- [BACKEND LOG] Llamando al servicio para buscar por estado...");
                return comandaService.getComandasByEstado(estadoEnum);
            } catch (IllegalArgumentException e) {
                System.err.println("--- [BACKEND ERROR] El estado '" + estado.get() + "' no es un valor válido del Enum EstadoComanda.");
                return List.of();
            }
        }

        System.out.println("--- [BACKEND LOG] El parámetro 'estado' no está presente. Se devolverán todas las comandas.");
        return comandaService.getAllComandas();
    }


    @GetMapping("/{id}")
    public ResponseEntity<ComandaResponseDTO> getComandaById(@PathVariable Long id) {
        return ResponseEntity.ok(comandaService.getComandaById(id));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<ComandaResponseDTO> updateComandaEstado(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(comandaService.updateEstadoComanda(id, payload));
    }
}