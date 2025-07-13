package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
import com.catasoft.restaurante.backend.model.dto.TicketDTO;
import com.catasoft.restaurante.backend.service.ComandaService;
import com.catasoft.restaurante.backend.service.WebSocketService;
import com.catasoft.restaurante.backend.service.TicketTemplateService;
import com.catasoft.restaurante.backend.dto.TicketTemplateDTO;
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
    private final TicketTemplateService ticketTemplateService;
    private static final Logger logger = LoggerFactory.getLogger(ImpresionController.class);

    @Autowired
    public ImpresionController(ComandaService comandaService, WebSocketService webSocketService, PrinterConfigurationService printerConfigService, TicketTemplateService ticketTemplateService) {
        this.comandaService = comandaService;
        this.webSocketService = webSocketService;
        this.printerConfigService = printerConfigService;
        this.ticketTemplateService = ticketTemplateService;
    }

    @PostMapping("/ticket-caja/{comandaId}")
    public ResponseEntity<Void> imprimirTicketCaja(@PathVariable Long comandaId) {
        logger.info("=== INICIO IMPRESIÓN TICKET CAJA ===");
        logger.info("Comanda ID: {}", comandaId);
        
        try {
            logger.info("Paso 1: Buscando configuración de impresora para rol 'CAJA'...");
            Optional<PrinterConfiguration> configOpt = printerConfigService.getConfigurationByRole("CAJA");
            logger.info("Configuración encontrada: {}", configOpt.isPresent());

            if (configOpt.isEmpty()) {
                logger.info("Paso 1.1: No hay configuración, creando por defecto...");
                try {
                    PrinterConfiguration defaultConfig = printerConfigService.createDefaultConfiguration("CAJA");
                    logger.info("Configuración por defecto creada: {}", defaultConfig.getPrinterTarget());
                    configOpt = Optional.of(defaultConfig);
                } catch (Exception e) {
                    logger.error("Error creando configuración por defecto: {}", e.getMessage());
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }
            }

            logger.info("Paso 2: Obteniendo datos del ticket...");
            TicketDTO ticketData = comandaService.getTicketData(comandaId);
            logger.info("Datos del ticket obtenidos: Mesa={}, Items={}", 
                ticketData.nombreMesa(), ticketData.items().size());
            
            logger.info("Paso 3: Creando PrintJob...");
            // Crear PrintJob con área y plantilla correctas
            String area = "caja";
            Long templateId = configOpt.get().getTemplateId();
            TicketTemplateDTO template = null;
            
            if (templateId != null) {
                template = ticketTemplateService.getTemplateById(templateId);
                if (template != null) {
                    logger.info("Plantilla personalizada encontrada: {}", template.getName());
                } else {
                    logger.info("No se encontró la plantilla personalizada, usando la por defecto del área");
                    template = ticketTemplateService.getTemplateByArea(area);
                }
            } else {
                template = ticketTemplateService.getTemplateByArea(area);
            }
            
            PrintJobDTO printJob = new PrintJobDTO(
                configOpt.get().getPrinterType(),
                configOpt.get().getPrinterTarget(),
                "CAJA",
                ticketData,
                area,
                template
            );
            logger.info("PrintJob creado: Tipo={}, Destino={}, Área={}, Plantilla={}", 
                printJob.printerType(), printJob.printerTarget(), area, 
                template != null ? template.getName() : "ninguna");
            
            logger.info("Paso 4: Enviando por WebSocket...");
            webSocketService.sendPrintJob(printJob);
            
            logger.info("Paso 5: Envío completado exitosamente");
            logger.info("=== FIN IMPRESIÓN TICKET CAJA ===");
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            logger.error("=== ERROR EN IMPRESIÓN TICKET CAJA ===");
            logger.error("Comanda ID: {}", comandaId);
            logger.error("Error: {}", e.getMessage());
            logger.error("Stack trace:", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}