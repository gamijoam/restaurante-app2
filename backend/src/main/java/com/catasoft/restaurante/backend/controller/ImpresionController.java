package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
import com.catasoft.restaurante.backend.model.dto.TicketDTO;
import com.catasoft.restaurante.backend.service.ComandaService;
import com.catasoft.restaurante.backend.service.WebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.catasoft.restaurante.backend.model.PrinterConfiguration;
import com.catasoft.restaurante.backend.service.PrinterConfigurationService;
import java.util.Optional;
@RestController
@RequestMapping("/api/v1/imprimir")
public class ImpresionController {
    private final PrinterConfigurationService printerConfigService;
    private final ComandaService comandaService;
    private final WebSocketService webSocketService;
    private static final Logger logger = LoggerFactory.getLogger(ImpresionController.class);

    @Autowired
    public ImpresionController(ComandaService comandaService, WebSocketService webSocketService, PrinterConfigurationService printerConfigService) {
        this.comandaService = comandaService;
        this.webSocketService = webSocketService;
        this.printerConfigService = printerConfigService;
    }

    @PostMapping("/ticket-caja/{comandaId}")
    public ResponseEntity<Void> imprimirTicketCaja(@PathVariable Long comandaId) {
        try {
            // Buscamos la configuración para el rol "CAJA"
            Optional<PrinterConfiguration> configOpt = printerConfigService.getConfigurationByRole("CAJA");

            if (configOpt.isEmpty()) {
                // Si no hay impresora configurada para la caja, devolvemos un error.
                // El frontend puede mostrar un mensaje "Impresora no configurada".
                logger.warn("Se intentó imprimir un ticket de caja, pero no hay impresora configurada para el rol 'CAJA'.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
            }

            TicketDTO ticketData = comandaService.getTicketData(comandaId);
            PrintJobDTO printJob = new PrintJobDTO(configOpt.get(), ticketData);
            webSocketService.sendPrintJob(printJob);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error en la solicitud de impresión para la comanda ID: {}", comandaId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}