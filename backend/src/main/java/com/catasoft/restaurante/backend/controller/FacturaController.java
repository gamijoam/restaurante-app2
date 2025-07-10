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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.catasoft.restaurante.backend.service.PdfService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/facturas")
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
    public ResponseEntity<byte[]> descargarFacturaPdf(@PathVariable Long id) {
        Factura factura = facturaService.getFacturaEntityById(id);
        byte[] pdfBytes = pdfService.generarPdfFactura(factura);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=factura-" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('GERENTE') or hasRole('CAJERO')")
    public ResponseEntity<FacturaResponseDTO> updateEstadoFactura(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String nuevoEstado = payload.get("estado");
        Factura factura = facturaService.getFacturaEntityById(id);
        factura.setEstado(nuevoEstado);
        facturaService.saveFactura(factura);
        FacturaResponseDTO dto = facturaService.getAllFacturas().stream()
            .filter(f -> f.getId().equals(id))
            .findFirst().orElse(null);
        return ResponseEntity.ok(dto);
    }
}