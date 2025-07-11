package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.DolarRateDTO;
import com.catasoft.restaurante.backend.dto.DolarRateRequestDTO;
import com.catasoft.restaurante.backend.service.DolarRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/dolar-rates")
@CrossOrigin(originPatterns = "*")
public class DolarRateController {
    
    private static final Logger logger = LoggerFactory.getLogger(DolarRateController.class);
    
    private final DolarRateService dolarRateService;
    
    @Autowired
    public DolarRateController(DolarRateService dolarRateService) {
        this.dolarRateService = dolarRateService;
    }
    
    /**
     * Obtiene todos los precios del dólar
     */
    @GetMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<List<DolarRateDTO>> getAllPreciosDolar() {
        try {
            List<DolarRateDTO> precios = dolarRateService.getAllPreciosDolar();
            return ResponseEntity.ok(precios);
        } catch (Exception e) {
            logger.error("Error obteniendo precios del dólar: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtiene el precio del dólar para hoy
     */
    @GetMapping("/hoy")
    public ResponseEntity<BigDecimal> getPrecioDolarHoy() {
        try {
            Optional<BigDecimal> precio = dolarRateService.getPrecioDolarHoy();
            if (precio.isPresent()) {
                return ResponseEntity.ok(precio.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error obteniendo precio del dólar de hoy: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtiene el precio del dólar para una fecha específica
     */
    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<BigDecimal> getPrecioDolarPorFecha(@PathVariable String fecha) {
        try {
            LocalDate localDate = LocalDate.parse(fecha);
            Optional<BigDecimal> precio = dolarRateService.getPrecioDolar(localDate);
            if (precio.isPresent()) {
                return ResponseEntity.ok(precio.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error obteniendo precio del dólar para fecha {}: {}", fecha, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Convierte un precio de USD a Bs usando el precio del dólar de hoy
     */
    @PostMapping("/convertir")
    public ResponseEntity<BigDecimal> convertirUsdABs(@RequestBody BigDecimal precioUsd) {
        try {
            BigDecimal precioBs = dolarRateService.convertirUsdABsHoy(precioUsd);
            return ResponseEntity.ok(precioBs);
        } catch (Exception e) {
            logger.error("Error convirtiendo USD a Bs: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Crea o actualiza el precio del dólar
     */
    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<DolarRateDTO> crearOActualizarPrecioDolar(@RequestBody DolarRateRequestDTO request) {
        try {
            DolarRateDTO dolarRate = dolarRateService.crearOActualizarPrecioDolar(request);
            return ResponseEntity.ok(dolarRate);
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creando/actualizando precio del dólar: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtiene un precio del dólar por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<DolarRateDTO> getPrecioDolarById(@PathVariable Long id) {
        try {
            Optional<DolarRateDTO> dolarRate = dolarRateService.getPrecioDolarById(id);
            if (dolarRate.isPresent()) {
                return ResponseEntity.ok(dolarRate.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error obteniendo precio del dólar por ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Desactiva un precio del dólar
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> desactivarPrecioDolar(@PathVariable Long id) {
        try {
            dolarRateService.desactivarPrecioDolar(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error de validación: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error desactivando precio del dólar ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
} 