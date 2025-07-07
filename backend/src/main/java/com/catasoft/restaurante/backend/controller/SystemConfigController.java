package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.service.SystemConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/config")
public class SystemConfigController {
    private final SystemConfigService systemConfigService;

    public SystemConfigController(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    @GetMapping("/impuesto")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<BigDecimal> getImpuesto() {
        return ResponseEntity.ok(systemConfigService.getImpuesto());
    }

    @PutMapping("/impuesto")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<Void> setImpuesto(@RequestBody BigDecimal nuevoImpuesto) {
        systemConfigService.setImpuesto(nuevoImpuesto);
        return ResponseEntity.ok().build();
    }
} 