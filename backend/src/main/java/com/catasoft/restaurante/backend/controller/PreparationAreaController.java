package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.PreparationArea;
import com.catasoft.restaurante.backend.service.PreparationAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/preparation-areas")
public class PreparationAreaController {
    @Autowired
    private PreparationAreaService preparationAreaService;

    @GetMapping
    public List<PreparationArea> getAll() {
        return preparationAreaService.findAll();
    }

    @GetMapping("/active")
    public List<PreparationArea> getActive() {
        return preparationAreaService.findActive();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PreparationArea> getById(@PathVariable Long id) {
        Optional<PreparationArea> area = preparationAreaService.findById(id);
        return area.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public PreparationArea create(@RequestBody PreparationArea area) {
        return preparationAreaService.save(area);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PreparationArea> update(@PathVariable Long id, @RequestBody PreparationArea area) {
        if (!preparationAreaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        area.setId(id);
        return ResponseEntity.ok(preparationAreaService.save(area));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        System.out.println("DELETE request recibido para área con ID: " + id);
        
        if (!preparationAreaService.findById(id).isPresent()) {
            System.out.println("Área con ID " + id + " no encontrada");
            return ResponseEntity.notFound().build();
        }
        
        System.out.println("Eliminando área con ID: " + id);
        preparationAreaService.delete(id);
        System.out.println("Área con ID " + id + " eliminada exitosamente");
        
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test")
    public ResponseEntity<String> testAreas() {
        try {
            List<PreparationArea> areas = preparationAreaService.findAll();
            StringBuilder sb = new StringBuilder();
            sb.append("Total áreas en BD: ").append(areas.size()).append("\n");
            
            for (PreparationArea area : areas) {
                sb.append("ID: ").append(area.getId())
                  .append(", AreaId: ").append(area.getAreaId())
                  .append(", Name: ").append(area.getName())
                  .append(", Type: ").append(area.getType())
                  .append(", Active: ").append(area.getActive())
                  .append("\n");
            }
            
            return ResponseEntity.ok(sb.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
} 