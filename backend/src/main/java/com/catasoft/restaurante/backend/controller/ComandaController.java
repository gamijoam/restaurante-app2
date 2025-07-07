    
package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.model.dto.TicketDTO;
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
import java.util.HashMap;


@RestController
@RequestMapping("/api/v1/comandas")
public class ComandaController {

    private final ComandaService comandaService;

    public ComandaController(ComandaService comandaService) {
        this.comandaService = comandaService;
    }
    /**
     * Endpoint para limpiar todos los ítems de una comanda y restaurar stock de ingredientes.
     * DELETE /api/v1/comandas/{id}/items
     */
    @DeleteMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO')")
    public ResponseEntity<Void> limpiarItemsComanda(@PathVariable Long id) {
        comandaService.limpiarItemsComanda(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/{id}/items")
@PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO')")
public ResponseEntity<ComandaResponseDTO> agregarItemsAComanda(
        @PathVariable Long id,
        @RequestBody List<ItemRequestDTO> items) {
    return ResponseEntity.ok(comandaService.agregarItemsAComanda(id, items));
}
    @PostMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
    public ResponseEntity<ComandaResponseDTO> createComanda(@RequestBody ComandaRequestDTO request) {
        ComandaResponseDTO nuevaComanda = comandaService.crearComanda(request);
        return new ResponseEntity<>(nuevaComanda, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
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
    @GetMapping("/{id}/ticket")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
    public ResponseEntity<TicketDTO> getComandaAsTicket(@PathVariable Long id) {
        TicketDTO ticketData = comandaService.getTicketData(id);
        return ResponseEntity.ok(ticketData);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
    public ResponseEntity<ComandaResponseDTO> getComandaById(@PathVariable Long id) {
        return ResponseEntity.ok(comandaService.getComandaById(id));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
    public ResponseEntity<ComandaResponseDTO> updateEstadoComanda(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(comandaService.updateEstadoComanda(id, payload));
    }

    // Endpoint de prueba para verificar el estado actual de una comanda
    @GetMapping("/{id}/estado-actual")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO')")
    public ResponseEntity<Map<String, Object>> getEstadoActualComanda(@PathVariable Long id) {
        ComandaResponseDTO comanda = comandaService.getComandaById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("id", comanda.getId());
        response.put("estado", comanda.getEstado());
        response.put("numeroMesa", comanda.getNumeroMesa());
        response.put("total", comanda.getTotal());
        response.put("puedeCancelar", comanda.getEstado() != EstadoComanda.CANCELADA && comanda.getEstado() != EstadoComanda.PAGADA);
        response.put("puedePagar", comanda.getEstado() != EstadoComanda.PAGADA && comanda.getEstado() != EstadoComanda.CANCELADA);
        return ResponseEntity.ok(response);
    }
}