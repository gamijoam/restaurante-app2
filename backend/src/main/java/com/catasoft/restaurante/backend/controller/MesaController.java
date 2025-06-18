package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.Mesa;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.MesaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/mesas")
public class MesaController {

    private final MesaRepository mesaRepository;

    public MesaController(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    /**
     * Endpoint para obtener todas las mesas.
     * HTTP GET http://localhost:8080/api/v1/mesas
     *
     * @return Lista de todas las mesas.
     */
    @GetMapping
    public List<Mesa> getAllMesas() {
        return mesaRepository.findAll();
    }

    /**
     * Endpoint para crear una nueva mesa.
     * HTTP POST http://localhost:8080/api/v1/mesas
     *
     * @param mesa La mesa a crear.
     * @return La mesa guardada con su ID.
     */
    @PostMapping
    public Mesa createMesa(@RequestBody Mesa mesa) {
        // Por defecto, una mesa nueva siempre está libre.
        mesa.setEstado(EstadoMesa.LIBRE);
        return mesaRepository.save(mesa);
    }

    /**
     * Endpoint para obtener una mesa por su ID.
     * HTTP GET http://localhost:8080/api/v1/mesas/1
     *
     * @param id El ID de la mesa a buscar.
     * @return La mesa encontrada.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Mesa> getMesaById(@PathVariable Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + id));
        return ResponseEntity.ok(mesa);
    }

    /**
     * Endpoint específico para cambiar el estado de una mesa.
     * HTTP PUT http://localhost:8080/api/v1/mesas/1/estado
     *
     * @param id El ID de la mesa a actualizar.
     * @param payload El cuerpo del JSON, esperando una clave "estado" con el nuevo valor.
     * @return La mesa con el estado actualizado.
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<Mesa> updateMesaEstado(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + id));

        String nuevoEstadoStr = payload.get("estado");
        if (nuevoEstadoStr == null) {
            // Si no mandan el estado, es una mala petición.
            return ResponseEntity.badRequest().build();
        }

        try {
            EstadoMesa nuevoEstado = EstadoMesa.valueOf(nuevoEstadoStr.toUpperCase());
            mesa.setEstado(nuevoEstado);
            Mesa mesaActualizada = mesaRepository.save(mesa);
            return ResponseEntity.ok(mesaActualizada);
        } catch (IllegalArgumentException e) {
            // Si mandan un texto que no es un estado válido.
            return ResponseEntity.badRequest().build();
        }
    }
}