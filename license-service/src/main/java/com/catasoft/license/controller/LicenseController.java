package com.catasoft.license.controller;

import com.catasoft.license.dto.LicenseRequestDTO;
import com.catasoft.license.dto.LicenseResponseDTO;
import com.catasoft.license.dto.ValidateRequestDTO;
import com.catasoft.license.model.License;
import com.catasoft.license.model.LicenseType;
import com.catasoft.license.repository.LicenseRepository;
import com.catasoft.license.service.LicenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.catasoft.license.repository.ActivationRepository;
import java.io.*;
import org.springframework.http.HttpStatus;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/license")
@CrossOrigin(origins = "*")
public class LicenseController {
    
    private final LicenseService licenseService;
    private final LicenseRepository licenseRepository;
    private final ActivationRepository activationRepository;
    

    
    /**
     * Genera una nueva licencia
     */
    @PostMapping("/generate")
    public ResponseEntity<LicenseResponseDTO> generateLicense(@Valid @RequestBody LicenseRequestDTO request) {
        try {
            LicenseResponseDTO response = licenseService.generateLicense(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LicenseResponseDTO errorResponse = new LicenseResponseDTO();
            errorResponse.setValid(false);
            errorResponse.setMessage("Error generando licencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Valida una licencia
     */
    @PostMapping("/validate")
    public ResponseEntity<LicenseResponseDTO> validateLicense(@Valid @RequestBody ValidateRequestDTO request) {
        try {
            LicenseResponseDTO response = licenseService.validateLicense(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LicenseResponseDTO errorResponse = new LicenseResponseDTO();
            errorResponse.setValid(false);
            errorResponse.setMessage("Error validando licencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Obtiene el estado de una licencia
     */
    @GetMapping("/status/{licenseCode}")
    public ResponseEntity<LicenseResponseDTO> getLicenseStatus(@PathVariable String licenseCode) {
        try {
            ValidateRequestDTO request = new ValidateRequestDTO();
            request.setLicenseCode(licenseCode);
            request.setFingerprint("STATUS_CHECK"); // Placeholder para verificación de estado
            
            LicenseResponseDTO response = licenseService.validateLicense(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LicenseResponseDTO errorResponse = new LicenseResponseDTO();
            errorResponse.setValid(false);
            errorResponse.setMessage("Error obteniendo estado: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Renueva una licencia
     */
    @PostMapping("/renew/{licenseCode}")
    public ResponseEntity<LicenseResponseDTO> renewLicense(
            @PathVariable String licenseCode,
            @RequestParam LicenseType newType) {
        try {
            // Buscar licencia existente
            var licenseOpt = licenseRepository.findByLicenseCode(licenseCode);
            if (licenseOpt.isEmpty()) {
                LicenseResponseDTO errorResponse = new LicenseResponseDTO();
                errorResponse.setValid(false);
                errorResponse.setMessage("Licencia no encontrada");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            License license = licenseOpt.get();
            
            // Crear nueva licencia con el nuevo tipo
            LicenseRequestDTO request = new LicenseRequestDTO();
            request.setLicenseType(newType);
            request.setClientName(license.getClientName());
            request.setClientContact(license.getClientContact());
            request.setNotes("Renovación de licencia " + licenseCode);
            
            // Generar nueva licencia
            LicenseResponseDTO response = licenseService.generateLicense(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            LicenseResponseDTO errorResponse = new LicenseResponseDTO();
            errorResponse.setValid(false);
            errorResponse.setMessage("Error renovando licencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Obtiene estadísticas de licencias
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLicenseStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            stats.put("totalLicenses", licenseRepository.count());
            stats.put("activeLicenses", licenseRepository.countActiveLicenses());
            stats.put("monthlyLicenses", licenseRepository.countActiveLicensesByType(LicenseType.MONTHLY));
            stats.put("annualLicenses", licenseRepository.countActiveLicensesByType(LicenseType.ANNUAL));
            stats.put("perpetualLicenses", licenseRepository.countActiveLicensesByType(LicenseType.PERPETUAL));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error obteniendo estadísticas: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Obtiene todas las licencias (para administración)
     */
    @GetMapping("/all")
    public ResponseEntity<List<License>> getAllLicenses() {
        try {
            List<License> licenses = licenseRepository.findAll();
            return ResponseEntity.ok(licenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Desactiva una licencia
     */
    @PostMapping("/deactivate/{licenseCode}")
    public ResponseEntity<Map<String, String>> deactivateLicense(@PathVariable String licenseCode) {
        try {
            var licenseOpt = licenseRepository.findByLicenseCode(licenseCode);
            if (licenseOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Licencia no encontrada");
                return ResponseEntity.badRequest().body(error);
            }
            
            License license = licenseOpt.get();
            license.setActive(false);
            licenseRepository.save(license);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Licencia desactivada exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error desactivando licencia: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Desactiva todas las activaciones por fingerprint
     */
    @PostMapping("/deactivate-activation")
    public ResponseEntity<Map<String, String>> deactivateActivation(@RequestParam String fingerprint) {
        try {
            // Buscar todas las activaciones por fingerprint
            java.util.List<com.catasoft.license.model.Activation> activations = activationRepository.findAllByFingerprint(fingerprint);
            if (activations == null || activations.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Activación no encontrada");
                return ResponseEntity.badRequest().body(error);
            }
            for (com.catasoft.license.model.Activation activation : activations) {
                activation.setActive(false);
                activationRepository.save(activation);
            }
            Map<String, String> response = new HashMap<>();
            response.put("message", "Activaciones desactivadas exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error desactivando activación: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Health check del servicio
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "License Service");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    // --- Persistencia local de licencia en license.json ---
    private static final String LOCAL_LICENSE_FILE = "license.json";
    private final ObjectMapper objectMapper;
    
    public LicenseController(LicenseService licenseService, LicenseRepository licenseRepository, ActivationRepository activationRepository, ObjectMapper objectMapper) {
        this.licenseService = licenseService;
        this.licenseRepository = licenseRepository;
        this.activationRepository = activationRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/local")
    public ResponseEntity<?> getLocalLicense() {
        try {
            File file = new File(System.getProperty("user.dir"), LOCAL_LICENSE_FILE);
            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe licencia local");
            }
            LicenseResponseDTO license = objectMapper.readValue(file, LicenseResponseDTO.class);
            return ResponseEntity.ok(license);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error leyendo licencia local: " + e.getMessage());
        }
    }

    @PostMapping("/local")
    public ResponseEntity<?> saveLocalLicense(@RequestBody LicenseResponseDTO license) {
        try {
            File file = new File(System.getProperty("user.dir"), LOCAL_LICENSE_FILE);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, license);
            return ResponseEntity.ok("Licencia guardada localmente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error guardando licencia local: " + e.getMessage());
        }
    }

    @DeleteMapping("/local")
    public ResponseEntity<?> deleteLocalLicense() {
        try {
            File file = new File(System.getProperty("user.dir"), LOCAL_LICENSE_FILE);
            if (file.exists()) {
                if (file.delete()) {
                    return ResponseEntity.ok("Licencia local eliminada");
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("No se pudo eliminar la licencia local");
                }
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe licencia local");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error eliminando licencia local: " + e.getMessage());
        }
    }
} 