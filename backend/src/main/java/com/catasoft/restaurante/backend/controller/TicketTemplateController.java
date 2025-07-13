package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.TicketTemplateDTO;
import com.catasoft.restaurante.backend.model.Area;
import com.catasoft.restaurante.backend.service.TicketTemplateService;
import com.catasoft.restaurante.backend.service.TicketPreviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/ticket-templates")
public class TicketTemplateController {
    
    @Autowired
    private TicketTemplateService ticketTemplateService;
    
    @Autowired
    private TicketPreviewService ticketPreviewService;
    
    // Obtener todas las áreas
    @GetMapping("/areas")
    public ResponseEntity<List<Area>> getAllAreas() {
        List<Area> areas = ticketTemplateService.getAllAreas();
        return ResponseEntity.ok(areas);
    }
    
    // Crear nueva área
    @PostMapping("/areas")
    public ResponseEntity<Area> createArea(@RequestBody Area area) {
        Area createdArea = ticketTemplateService.createArea(area);
        return ResponseEntity.ok(createdArea);
    }
    
    // Obtener plantilla por área
    @GetMapping("/area/{areaId}")
    public ResponseEntity<TicketTemplateDTO> getTemplateByArea(@PathVariable String areaId) {
        TicketTemplateDTO template = ticketTemplateService.getTemplateByArea(areaId);
        if (template != null) {
            return ResponseEntity.ok(template);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Guardar plantilla
    @PostMapping
    public ResponseEntity<TicketTemplateDTO> saveTemplate(@RequestBody TicketTemplateDTO templateDTO) {
        TicketTemplateDTO savedTemplate = ticketTemplateService.saveTemplate(templateDTO);
        return ResponseEntity.ok(savedTemplate);
    }
    
    // Actualizar plantilla
    @PutMapping("/{id}")
    public ResponseEntity<TicketTemplateDTO> updateTemplate(@PathVariable Long id, @RequestBody TicketTemplateDTO templateDTO) {
        templateDTO.setId(id);
        TicketTemplateDTO updatedTemplate = ticketTemplateService.saveTemplate(templateDTO);
        return ResponseEntity.ok(updatedTemplate);
    }
    
    // Obtener todas las plantillas
    @GetMapping
    public ResponseEntity<List<TicketTemplateDTO>> getAllTemplates() {
        List<TicketTemplateDTO> templates = ticketTemplateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }
    
    // Eliminar plantilla
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        ticketTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
    
    // Crear plantilla por defecto para un área
    @PostMapping("/default/{areaId}")
    public ResponseEntity<TicketTemplateDTO> createDefaultTemplate(@PathVariable String areaId, @RequestParam String areaName) {
        TicketTemplateDTO template = ticketTemplateService.createDefaultTemplate(areaId, areaName);
        return ResponseEntity.ok(template);
    }
    
    // Generar previsualización PDF de una plantilla
    @PostMapping("/{id}/preview")
    public ResponseEntity<byte[]> generatePreview(@PathVariable Long id) {
        try {
            TicketTemplateDTO template = ticketTemplateService.getTemplateById(id);
            if (template == null) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] pdfBytes = ticketPreviewService.generatePreviewPdf(template);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ticket-preview.pdf");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Generar previsualización PDF de una plantilla temporal (sin guardar)
    @PostMapping("/preview-temp")
    public ResponseEntity<byte[]> generateTempPreview(@RequestBody TicketTemplateDTO templateDTO) {
        try {
            byte[] pdfBytes = ticketPreviewService.generatePreviewPdf(templateDTO);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ticket-preview-temp.pdf");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Endpoint de prueba para verificar plantillas
    @GetMapping("/debug/templates")
    public ResponseEntity<Map<String, Object>> debugTemplates() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Obtener todas las plantillas
            List<TicketTemplateDTO> allTemplates = ticketTemplateService.getAllTemplates();
            result.put("totalTemplates", allTemplates.size());
            result.put("templates", allTemplates);
            
            // Verificar plantillas por área específica
            String[] areas = {"COCINA", "CAJA", "BARRA"};
            Map<String, Object> areaTemplates = new HashMap<>();
            
            for (String area : areas) {
                TicketTemplateDTO template = ticketTemplateService.getTemplateByArea(area);
                areaTemplates.put(area, template != null ? template.getName() : "NO ENCONTRADA");
            }
            result.put("areaTemplates", areaTemplates);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Endpoint para inicializar plantillas por defecto
    @PostMapping("/init-defaults")
    public ResponseEntity<Map<String, Object>> initializeDefaultTemplates() {
        try {
            ticketTemplateService.ensureDefaultTemplates();
            return ResponseEntity.ok(Map.of(
                "message", "Plantillas por defecto inicializadas correctamente",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", e.getMessage(),
                "status", "error"
            ));
        }
    }
    
    // Endpoint público para debuggear plantillas (sin autenticación)
    @GetMapping("/public/debug/templates")
    public ResponseEntity<Map<String, Object>> publicDebugTemplates() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Obtener todas las plantillas
            List<TicketTemplateDTO> allTemplates = ticketTemplateService.getAllTemplates();
            result.put("totalTemplates", allTemplates.size());
            result.put("templates", allTemplates);
            
            // Verificar plantillas por área específica
            String[] areas = {"COCINA", "CAJA", "BARRA"};
            Map<String, Object> areaTemplates = new HashMap<>();
            
            for (String area : areas) {
                TicketTemplateDTO template = ticketTemplateService.getTemplateByArea(area);
                areaTemplates.put(area, template != null ? template.getName() : "NO ENCONTRADA");
            }
            result.put("areaTemplates", areaTemplates);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
} 