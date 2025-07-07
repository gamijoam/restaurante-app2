package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.ComandaArea;
import com.catasoft.restaurante.backend.model.ComandaAreaItem;
import com.catasoft.restaurante.backend.model.ComandaArea.EstadoComandaArea;
import com.catasoft.restaurante.backend.service.ComandaAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/comanda-areas")
public class ComandaAreaController {
    @Autowired
    private ComandaAreaService comandaAreaService;

    @GetMapping
    public List<ComandaArea> getAll() {
        return comandaAreaService.findAll();
    }

    @GetMapping("/area/{areaId}")
    public List<ComandaArea> getByArea(@PathVariable String areaId, @RequestParam(required = false) EstadoComandaArea status) {
        if (status != null) {
            return comandaAreaService.findByAreaIdAndStatus(areaId, status);
        } else {
            return comandaAreaService.findAll();
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

    // --- Items ---
    @GetMapping("/{id}/items")
    public List<ComandaAreaItem> getItems(@PathVariable Long id) {
        return comandaAreaService.findItemsByComandaAreaId(id);
    }
} 