package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ReporteVentasDTO;
import com.catasoft.restaurante.backend.service.PdfService;
import com.catasoft.restaurante.backend.service.ReporteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reportes")

public class ReporteController {

    private final ReporteService reporteService;
    private final PdfService pdfService;

    public ReporteController(ReporteService reporteService, PdfService pdfService) {
        this.reporteService = reporteService;
        this.pdfService = pdfService;
    }

    @GetMapping("/ventas")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<ReporteVentasDTO> getReporteDeVentas(
            @RequestParam("fechaInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam("fechaFin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        // 1. Llamamos al servicio para que haga el trabajo real
        ReporteVentasDTO reporte = reporteService.generarReporteVentas(fechaInicio, fechaFin);

        // 2. Devolvemos el DTO con los datos del reporte como respuesta
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/ventas/pdf")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<byte[]> exportarReporteVentasPdf(
            @RequestParam("fechaInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam("fechaFin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        ReporteVentasDTO reporte = reporteService.generarReporteVentas(fechaInicio, fechaFin);
        ByteArrayInputStream pdfStream = pdfService.generarPdfReporteVentas(reporte);
        byte[] pdfBytes = pdfStream.readAllBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_ventas.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/ventas/excel")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<byte[]> exportarReporteVentasExcel(
            @RequestParam("fechaInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam("fechaFin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        ReporteVentasDTO reporte = reporteService.generarReporteVentas(fechaInicio, fechaFin);
        ByteArrayInputStream excelStream = reporteService.exportarReporteVentasExcel(reporte);
        byte[] excelBytes = excelStream.readAllBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_ventas.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}