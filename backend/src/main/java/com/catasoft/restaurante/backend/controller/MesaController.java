package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ComandaResponseDTO; // <-- NUEVA IMPORTACIÓN
import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.Mesa;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.MesaRepository;
import com.catasoft.restaurante.backend.service.ComandaService; // <-- NUEVA IMPORTACIÓN
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // <-- NUEVA IMPORTACIÓN
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/mesas")
public class MesaController {

    private final MesaRepository mesaRepository;
    private final ComandaService comandaService; // <-- 1. AÑADIMOS EL SERVICIO DE COMANDAS

    // 2. ACTUALIZAMOS EL CONSTRUCTOR PARA INYECTAR AMBOS SERVICIOS
    public MesaController(MesaRepository mesaRepository, ComandaService comandaService) {
        this.mesaRepository = mesaRepository;
        this.comandaService = comandaService;
    }

    // --- TUS MÉTODOS EXISTENTES (NO CAMBIAN) ---
    @GetMapping
    public List<Mesa> getAllMesas() {
        return mesaRepository.findAll();
    }

    @PostMapping
    public Mesa createMesa(@RequestBody Mesa mesa) {
        mesa.setEstado(EstadoMesa.LIBRE);
        return mesaRepository.save(mesa);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mesa> getMesaById(@PathVariable Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + id));
        return ResponseEntity.ok(mesa);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Mesa> updateMesaEstado(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + id));

        String nuevoEstadoStr = payload.get("estado");
        if (nuevoEstadoStr == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            EstadoMesa nuevoEstado = EstadoMesa.valueOf(nuevoEstadoStr.toUpperCase());
            mesa.setEstado(nuevoEstado);
            Mesa mesaActualizada = mesaRepository.save(mesa);
            return ResponseEntity.ok(mesaActualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- 3. AÑADIMOS EL NUEVO ENDPOINT ---
    @GetMapping("/{id}/comanda-activa")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO')")
    public ResponseEntity<ComandaResponseDTO> getComandaActivaPorMesa(@PathVariable Long id) {
        return comandaService.getComandaActivaPorMesa(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}