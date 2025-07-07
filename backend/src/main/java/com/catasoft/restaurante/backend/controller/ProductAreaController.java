package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.ProductArea;
import com.catasoft.restaurante.backend.service.ProductAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/product-areas")
public class ProductAreaController {
    @Autowired
    private ProductAreaService productAreaService;

    @GetMapping
    public List<ProductArea> getAll() {
        return productAreaService.findAll();
    }

    @GetMapping("/area/{areaId}")
    public List<ProductArea> getByArea(@PathVariable String areaId) {
        return productAreaService.findByAreaId(areaId);
    }

    @GetMapping("/product/{productoId}")
    public List<ProductArea> getByProducto(@PathVariable Long productoId) {
        return productAreaService.findByProductoId(productoId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductArea> getById(@PathVariable Long id) {
        Optional<ProductArea> pa = productAreaService.findById(id);
        return pa.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ProductArea create(@RequestBody ProductArea pa) {
        return productAreaService.save(pa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductArea> update(@PathVariable Long id, @RequestBody ProductArea pa) {
        if (!productAreaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        pa.setId(id);
        return ResponseEntity.ok(productAreaService.save(pa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!productAreaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        productAreaService.delete(id);
        return ResponseEntity.noContent().build();
    }
} 