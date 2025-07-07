package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.dto.MesaMapaDTO;
import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.Mesa;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.MesaRepository;
import com.catasoft.restaurante.backend.service.ComandaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1/mesas")
public class MesaController {

    private final MesaRepository mesaRepository;
    private final ComandaService comandaService;

    public MesaController(MesaRepository mesaRepository, ComandaService comandaService) {
        this.mesaRepository = mesaRepository;
        this.comandaService = comandaService;
    }

    // --- MÉTODOS EXISTENTES ---
    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
    public List<Mesa> getAllMesas() {
        return mesaRepository.findAll().stream().filter(Mesa::getActivo).collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public Mesa createMesa(@RequestBody Mesa mesa) {
        // Si no se especifica estado, establecer como LIBRE
        if (mesa.getEstado() == null) {
            mesa.setEstado(EstadoMesa.LIBRE);
        }
        
        // Validar que el número de mesa sea único
        if (mesaRepository.findByNumero(mesa.getNumero()).isPresent()) {
            throw new IllegalStateException("Ya existe una mesa con el número: " + mesa.getNumero());
        }
        
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

    @GetMapping("/{id}/comanda-activa")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
    public ResponseEntity<ComandaResponseDTO> getComandaActivaPorMesa(@PathVariable Long id) {
        return comandaService.getComandaActivaPorMesa(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> deleteMesa(@PathVariable Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + id));
        mesa.setActivo(false);
        mesaRepository.save(mesa);
        return ResponseEntity.noContent().build();
    }

    // --- NUEVOS ENDPOINTS PARA EL MAPA ---
    
    /**
     * Obtiene todas las mesas con información para el mapa visual
     */
    @GetMapping("/mapa")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMARERO', 'COCINERO')")
    public List<MesaMapaDTO> getMesasMapa() {
        List<Mesa> mesas = mesaRepository.findAll().stream().filter(Mesa::getActivo).collect(Collectors.toList());
        return mesas.stream()
                .map(this::convertToMapaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza la posición de una mesa en el mapa
     */
    @PutMapping("/{id}/posicion")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Mesa> updateMesaPosicion(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + id));

        System.out.println("Actualizando posición de mesa " + id + " con payload: " + payload);

        // Manejar posicionX
        Object posicionXObj = payload.get("posicionX");
        if (posicionXObj != null) {
            Integer posicionX;
            if (posicionXObj instanceof Number) {
                posicionX = ((Number) posicionXObj).intValue();
            } else if (posicionXObj instanceof String) {
                posicionX = Integer.parseInt((String) posicionXObj);
            } else {
                posicionX = null;
            }
            if (posicionX != null) {
                mesa.setPosicionX(posicionX);
                System.out.println("Posición X actualizada a: " + posicionX);
            }
        }

        // Manejar posicionY
        Object posicionYObj = payload.get("posicionY");
        if (posicionYObj != null) {
            Integer posicionY;
            if (posicionYObj instanceof Number) {
                posicionY = ((Number) posicionYObj).intValue();
            } else if (posicionYObj instanceof String) {
                posicionY = Integer.parseInt((String) posicionYObj);
            } else {
                posicionY = null;
            }
            if (posicionY != null) {
                mesa.setPosicionY(posicionY);
                System.out.println("Posición Y actualizada a: " + posicionY);
            }
        }

        // Manejar nombre
        Object nombreObj = payload.get("nombre");
        if (nombreObj != null && nombreObj instanceof String) {
            mesa.setNombre((String) nombreObj);
        }

        Mesa mesaActualizada = mesaRepository.save(mesa);
        System.out.println("Mesa actualizada: " + mesaActualizada);
        
        return ResponseEntity.ok(mesaActualizada);
    }

    /**
     * Actualiza múltiples mesas a la vez (para drag & drop)
     */
    @PutMapping("/posiciones")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<List<Mesa>> updateMesasPosiciones(@RequestBody List<Map<String, Object>> mesasData) {
        List<Mesa> mesasActualizadas = mesasData.stream()
                .map(data -> {
                    Long id = Long.valueOf(data.get("id").toString());
                    Mesa mesa = mesaRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + id));
                    
                    Integer posicionX = (Integer) data.get("posicionX");
                    Integer posicionY = (Integer) data.get("posicionY");
                    String nombre = (String) data.get("nombre");
                    
                    if (posicionX != null) mesa.setPosicionX(posicionX);
                    if (posicionY != null) mesa.setPosicionY(posicionY);
                    if (nombre != null) mesa.setNombre(nombre);
                    
                    return mesaRepository.save(mesa);
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(mesasActualizadas);
    }

    // Método auxiliar para convertir Mesa a MesaMapaDTO
    private MesaMapaDTO convertToMapaDTO(Mesa mesa) {
        return new MesaMapaDTO(
            mesa.getId(),
            mesa.getNumero(),
            mesa.getCapacidad(),
            mesa.getEstado(),
            mesa.getPosicionX(),
            mesa.getPosicionY(),
            mesa.getNombre()
        );
    }
}