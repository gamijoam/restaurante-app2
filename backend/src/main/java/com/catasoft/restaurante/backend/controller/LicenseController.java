package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.license.LicenseValidationRequest;
import com.catasoft.restaurante.backend.dto.license.LicenseValidationResponse;
import com.catasoft.restaurante.backend.service.LicenseClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/license")
@CrossOrigin(origins = "*")
public class LicenseController {
    
    @Autowired
    private LicenseClientService licenseClientService;
    
    /**
     * Valida una licencia
     */
    @PostMapping("/validate")
    public ResponseEntity<LicenseValidationResponse> validateLicense(@Valid @RequestBody LicenseValidationRequest request) {
        System.out.println("[LicenseController] Body recibido: licenseCode=" + request.getLicenseCode() + ", fingerprint=" + request.getFingerprint());
        try {
            LicenseValidationResponse response = licenseClientService.validateLicense(
                request.getLicenseCode(), request.getFingerprint());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LicenseValidationResponse errorResponse = new LicenseValidationResponse();
            errorResponse.setValid(false);
            errorResponse.setMessage("Error validando licencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Obtiene el estado de una licencia
     */
    @GetMapping("/status/{licenseCode}")
    public ResponseEntity<LicenseValidationResponse> getLicenseStatus(@PathVariable String licenseCode) {
        try {
            LicenseValidationResponse response = licenseClientService.getLicenseStatus(licenseCode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LicenseValidationResponse errorResponse = new LicenseValidationResponse();
            errorResponse.setValid(false);
            errorResponse.setMessage("Error obteniendo estado: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Verifica si el servicio de licencias está disponible
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkLicenseServiceHealth() {
        Map<String, Object> response = new HashMap<>();
        
        boolean isAvailable = licenseClientService.isLicenseServiceAvailable();
        response.put("available", isAvailable);
        response.put("service", "License Service");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        
        if (isAvailable) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(503).body(response);
        }
    }
} 