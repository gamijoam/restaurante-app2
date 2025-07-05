package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ReporteVentasDTO;
import com.catasoft.restaurante.backend.service.ReporteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reportes")

public class ReporteController {

    private final ReporteService reporteService;

    public ReporteController(ReporteService reporteService) {
        this.reporteService = reporteService;
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
}