package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.BusinessConfigDTO;
import com.catasoft.restaurante.backend.service.BusinessConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/business-config")
@CrossOrigin(originPatterns = "*")
public class BusinessConfigController {
    
    private static final Logger logger = LoggerFactory.getLogger(BusinessConfigController.class);
    
    @Autowired
    private BusinessConfigService businessConfigService;
    
    /**
     * Obtener la configuración activa del negocio
     */
    @GetMapping
    public ResponseEntity<BusinessConfigDTO> getActiveConfig() {
        try {
            logger.info("Solicitando configuración activa del negocio");
            BusinessConfigDTO config = businessConfigService.getActiveConfig();
            logger.info("Configuración obtenida exitosamente: {}", config.getBusinessName());
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            logger.error("Error al obtener configuración del negocio: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Guardar o actualizar la configuración del negocio
     */
    @PostMapping
    public ResponseEntity<BusinessConfigDTO> saveConfig(@RequestBody BusinessConfigDTO configDTO) {
        BusinessConfigDTO savedConfig = businessConfigService.saveConfig(configDTO);
        return ResponseEntity.ok(savedConfig);
    }
    
    /**
     * Actualizar la configuración del negocio
     */
    @PutMapping("/{id}")
    public ResponseEntity<BusinessConfigDTO> updateConfig(@PathVariable Long id, @RequestBody BusinessConfigDTO configDTO) {
        configDTO.setId(id);
        BusinessConfigDTO updatedConfig = businessConfigService.saveConfig(configDTO);
        return ResponseEntity.ok(updatedConfig);
    }
} 