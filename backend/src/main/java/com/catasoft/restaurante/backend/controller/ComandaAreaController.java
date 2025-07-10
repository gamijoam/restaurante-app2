package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.ComandaArea;
import com.catasoft.restaurante.backend.model.ComandaAreaItem;
import com.catasoft.restaurante.backend.model.ComandaArea.EstadoComandaArea;
import com.catasoft.restaurante.backend.service.ComandaAreaService;
import com.catasoft.restaurante.backend.service.ComandaService;
import com.catasoft.restaurante.backend.service.ProductAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import com.catasoft.restaurante.backend.dto.ComandaAreaResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.model.ProductArea;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import java.util.stream.Collectors;
import com.catasoft.restaurante.backend.repository.ComandaAreaRepository;
import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
import com.catasoft.restaurante.backend.service.WebSocketService;

@RestController
@RequestMapping("/api/v1/comanda-areas")
public class ComandaAreaController {
    private static final Logger log = LoggerFactory.getLogger(ComandaAreaController.class);

    @Autowired
    private ComandaAreaService comandaAreaService;

    @Autowired
    private ComandaService comandaService;

    @Autowired
    private ProductAreaService productAreaService;

    @Autowired
    private ComandaAreaRepository comandaAreaRepository;

    @Autowired
    private WebSocketService webSocketService;

    @GetMapping
    public List<ComandaArea> getAll() {
        return comandaAreaService.findAll();
    }

    @GetMapping("/area/{areaId}")
    public ResponseEntity<List<ComandaAreaResponseDTO>> getComandasPorArea(@PathVariable Long areaId) {
        try {
            log.info("Solicitando comandas para área: {}", areaId);
            
            // Primero, verificar qué hay en la base de datos
            List<ComandaArea> todasLasComandas = comandaAreaService.findAll();
            log.info("Total comandas en BD: {}", todasLasComandas.size());
            
            for (ComandaArea ca : todasLasComandas) {
                log.info("ComandaArea ID: {}, AreaId: {}, Status: {}, ComandaId: {}", 
                    ca.getId(), ca.getAreaId(), ca.getStatus(), ca.getComanda().getId());
            }
            
            List<ComandaAreaResponseDTO> comandas = comandaAreaService.getComandasPorArea(areaId);
            log.info("Comandas encontradas para área {}: {}", areaId, comandas.size());
            return ResponseEntity.ok(comandas);
        } catch (Exception e) {
            log.error("Error al obtener comandas por área: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/comanda/{comandaId}")
    public ResponseEntity<List<ComandaAreaResponseDTO>> getComandasPorComanda(@PathVariable Long comandaId) {
        try {
            log.info("Solicitando comandas por área para comanda: {}", comandaId);
            
            List<ComandaArea> comandas = comandaAreaRepository.findByComandaId(comandaId);
            log.info("Comandas encontradas para comanda {}: {}", comandaId, comandas.size());
            
            // Convertir a DTOs usando el servicio
            List<ComandaAreaResponseDTO> result = comandas.stream()
                .map(comandaArea -> {
                    try {
                        // Usar el método privado del servicio para convertir
                        return comandaAreaService.convertToResponseDTO(comandaArea);
                    } catch (Exception e) {
                        log.error("Error convirtiendo comanda area: {}", e.getMessage());
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error al obtener comandas por comanda: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComandaArea> getById(@PathVariable Long id) {
        Optional<ComandaArea> ca = comandaAreaService.findById(id);
        return ca.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ComandaArea create(@RequestBody ComandaArea ca) {
        return comandaAreaService.save(ca);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComandaArea> update(@PathVariable Long id, @RequestBody ComandaArea ca) {
        if (!comandaAreaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        ca.setId(id);
        return ResponseEntity.ok(comandaAreaService.save(ca));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!comandaAreaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        comandaAreaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/imprimir")
    public ResponseEntity<Void> imprimirComandaArea(@PathVariable Long id) {
        try {
            comandaAreaService.imprimirComandaArea(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al imprimir comanda de área: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Items ---
    @GetMapping("/{id}/items")
    public List<ComandaAreaItem> getItems(@PathVariable Long id) {
        return comandaAreaService.findItemsByComandaAreaId(id);
    }

    // --- Cambio de Estados ---
    @PutMapping("/{id}/start-preparation")
    public ResponseEntity<ComandaArea> startPreparation(@PathVariable Long id) {
        try {
            ComandaArea comandaArea = comandaAreaService.startPreparation(id);
            return ResponseEntity.ok(comandaArea);
        } catch (Exception e) {
            log.error("Error al iniciar preparación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/mark-ready")
    public ResponseEntity<ComandaArea> markAsReady(@PathVariable Long id) {
        try {
            ComandaArea comandaArea = comandaAreaService.markAsReady(id);
            return ResponseEntity.ok(comandaArea);
        } catch (Exception e) {
            log.error("Error al marcar como listo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/mark-delivered")
    public ResponseEntity<ComandaArea> markAsDelivered(@PathVariable Long id) {
        try {
            ComandaArea comandaArea = comandaAreaService.markAsDelivered(id);
            return ResponseEntity.ok(comandaArea);
        } catch (Exception e) {
            log.error("Error al marcar como entregado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testComandas() {
        try {
            List<ComandaArea> todas = comandaAreaService.findAll();
            StringBuilder sb = new StringBuilder();
            sb.append("Total comandas en BD: ").append(todas.size()).append("\n");
            
            for (ComandaArea ca : todas) {
                sb.append("ComandaArea ID: ").append(ca.getId())
                  .append(", AreaId: ").append(ca.getAreaId())
                  .append(", Status: ").append(ca.getStatus())
                  .append(", ComandaId: ").append(ca.getComanda().getId())
                  .append("\n");
            }
            
            return ResponseEntity.ok(sb.toString());
        } catch (Exception e) {
            log.error("Error en test: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/test/division")
    public ResponseEntity<Map<String, Object>> testDivision() {
        try {
            log.info("=== TEST DIVISIÓN DE COMANDAS ===");
            
            // Verificar todas las comandas
            List<ComandaResponseDTO> todasComandas = comandaService.getAllComandas();
            log.info("Total comandas en BD: {}", todasComandas.size());
            
            // Verificar comandas por área
            List<ComandaArea> todasComandasArea = comandaAreaService.findAll();
            log.info("Total comandas divididas por área: {}", todasComandasArea.size());
            
            // Verificar productos por área
            List<ProductArea> productosPorArea = productAreaService.findAll();
            log.info("Total productos asignados a áreas: {}", productosPorArea.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("totalComandas", todasComandas.size());
            result.put("totalComandasDivididas", todasComandasArea.size());
            result.put("totalProductosPorArea", productosPorArea.size());
            
            // Detalles de las comandas divididas
            List<Map<String, Object>> detallesComandas = new ArrayList<>();
            for (ComandaArea ca : todasComandasArea) {
                Map<String, Object> detalle = new HashMap<>();
                detalle.put("id", ca.getId());
                detalle.put("areaId", ca.getAreaId());
                detalle.put("status", ca.getStatus());
                detalle.put("comandaId", ca.getComanda().getId());
                detalle.put("items", ca.getItems().size());
                detallesComandas.add(detalle);
            }
            result.put("detallesComandas", detallesComandas);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error en test de división: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 