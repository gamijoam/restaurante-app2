package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.service.ComandaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public List<ComandaResponseDTO> getAllComandas() {
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