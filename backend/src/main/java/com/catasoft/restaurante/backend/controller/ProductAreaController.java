package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.area.ProductAreaDTO;
import com.catasoft.restaurante.backend.dto.area.ProductAreaRequestDTO;
import com.catasoft.restaurante.backend.model.ProductArea;
import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.repository.ProductoRepository;
import com.catasoft.restaurante.backend.repository.ProductAreaRepository;
import com.catasoft.restaurante.backend.service.ProductAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/product-areas")
public class ProductAreaController {
    @Autowired
    private ProductAreaService productAreaService;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private ProductAreaRepository productAreaRepository;

    @GetMapping
    public List<ProductAreaDTO> getAll() {
        return productAreaService.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/area/{areaId}")
    public List<ProductAreaDTO> getByArea(@PathVariable String areaId) {
        return productAreaService.findByAreaId(areaId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/product/{productoId}")
    public List<ProductAreaDTO> getByProducto(@PathVariable Long productoId) {
        return productAreaService.findByProductoId(productoId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductAreaDTO> getById(@PathVariable Long id) {
        Optional<ProductArea> pa = productAreaService.findById(id);
        return pa.map(productArea -> ResponseEntity.ok(convertToDTO(productArea)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductAreaRequestDTO requestDTO) {
        try {
            ProductArea productArea = convertToEntity(requestDTO);
            ProductArea saved = productAreaService.save(productArea);
            return ResponseEntity.ok(convertToDTO(saved));
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("uk_product_area")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe una asignación para este producto en esta área");
            }
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ProductAreaRequestDTO requestDTO) {
        try {
            if (!productAreaService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            ProductArea productArea = convertToEntity(requestDTO);
            productArea.setId(id);
            ProductArea saved = productAreaService.save(productArea);
            return ResponseEntity.ok(convertToDTO(saved));
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("uk_product_area")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe una asignación para este producto en esta área");
            }
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!productAreaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        productAreaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test/producto/{productoId}")
    public ResponseEntity<Map<String, Object>> testProductoAsignacion(@PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();
        
        // Verificar si el producto existe
        Optional<Producto> productoOpt = productoRepository.findById(productoId);
        if (!productoOpt.isPresent()) {
            response.put("error", "Producto no encontrado");
            return ResponseEntity.badRequest().body(response);
        }
        
        Producto producto = productoOpt.get();
        response.put("producto", Map.of(
            "id", producto.getId(),
            "nombre", producto.getNombre(),
            "categoria", producto.getCategoria()
        ));
        
        // Verificar asignaciones
        List<ProductArea> asignaciones = productAreaRepository.findByProductoId(productoId);
        response.put("asignaciones", asignaciones.stream()
            .map(pa -> Map.of(
                "id", pa.getId(),
                "areaId", pa.getAreaId(),
                "preparationTime", pa.getPreparationTime()
            ))
            .collect(Collectors.toList()));
        
        response.put("totalAsignaciones", asignaciones.size());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testProductAreas() {
        try {
            List<ProductArea> asignaciones = productAreaService.findAll();
            StringBuilder sb = new StringBuilder();
            sb.append("Total asignaciones producto-área: ").append(asignaciones.size()).append("\n");
            
            for (ProductArea pa : asignaciones) {
                sb.append("Producto ID: ").append(pa.getProducto().getId())
                  .append(", Nombre: ").append(pa.getProducto().getNombre())
                  .append(", Área ID: ").append(pa.getAreaId())
                  .append("\n");
            }
            
            return ResponseEntity.ok(sb.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // Métodos de conversión
    private ProductAreaDTO convertToDTO(ProductArea productArea) {
        return new ProductAreaDTO(
            productArea.getId(),
            productArea.getProducto() != null ? productArea.getProducto().getId() : null,
            productArea.getAreaId(),
            productArea.getPreparationTime(),
            productArea.getCreatedAt(),
            productArea.getUpdatedAt()
        );
    }

    private ProductArea convertToEntity(ProductAreaRequestDTO dto) {
        ProductArea productArea = new ProductArea();
        productArea.setAreaId(dto.getAreaId());
        productArea.setPreparationTime(dto.getPreparationTime());
        
        // Crear un producto temporal con solo el ID para la relación
        if (dto.getProductId() != null) {
            Producto producto = new Producto();
            producto.setId(dto.getProductId());
            productArea.setProducto(producto);
        }
        
        return productArea;
    }
} 