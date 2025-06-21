package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.FacturaResponseDTO;
import com.catasoft.restaurante.backend.model.Factura;
import com.catasoft.restaurante.backend.service.FacturaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders; // <-- NUEVA IMPORTACIÓN
import org.springframework.http.MediaType;
import com.catasoft.restaurante.backend.service.PdfService; // <-- NUEVA IMPORTACIÓN
import org.springframework.core.io.InputStreamResource;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/facturas")
@CrossOrigin(origins = "http://localhost:5173")
public class FacturaController {

    private final FacturaService facturaService;
    private final PdfService pdfService;
    public FacturaController(FacturaService facturaService, PdfService pdfService) {
        this.facturaService = facturaService;
        this.pdfService = pdfService;
    }

    @GetMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<List<FacturaResponseDTO>> getAllFacturas(
            @RequestParam Optional<LocalDate> fechaInicio,
            @RequestParam Optional<LocalDate> fechaFin) {

        if (fechaInicio.isPresent() && fechaFin.isPresent()) {
            return ResponseEntity.ok(facturaService.getFacturasByDateRange(fechaInicio.get(), fechaFin.get()));
        }
        return ResponseEntity.ok(facturaService.getAllFacturas());
    }
    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<InputStreamResource> descargarFacturaPdf(@PathVariable Long id) {
        Factura factura = facturaService.getFacturaEntityById(id);
        ByteArrayInputStream pdf = pdfService.generarPdfFactura(factura);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=factura-" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdf));
    }
}