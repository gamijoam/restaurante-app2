package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.TicketTemplateDTO;
import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);
    private final SimpMessagingTemplate messagingTemplate;
    private final TicketTemplateService ticketTemplateService;

    @Autowired
    public WebSocketService(SimpMessagingTemplate messagingTemplate, TicketTemplateService ticketTemplateService) {
        this.messagingTemplate = messagingTemplate;
        this.ticketTemplateService = ticketTemplateService;
    }

    public void sendPrintJob(PrintJobDTO printJob) {
        try {
            TicketTemplateDTO template = printJob.template();
            if (template == null) {
                // Solo si no viene plantilla, buscar por área
                template = getTemplateForArea(printJob.area());
            }

            PrintJobDTO printJobWithTemplate = new PrintJobDTO(
                printJob.printerType(),
                printJob.printerTarget(),
                printJob.ticketType(),
                printJob.ticketData(),
                printJob.area(),
                template
            );

            String destination = "/topic/print-jobs";
            messagingTemplate.convertAndSend(destination, printJobWithTemplate);
            logger.info("Trabajo de impresión enviado a [{}]. Destino: {}, Área: {}, Plantilla: {}", 
                printJob.printerType(), printJob.printerTarget(), printJob.area(), 
                template != null ? "encontrada" : "no encontrada");
        } catch (Exception e) {
            logger.error("Error al enviar el trabajo de impresión por WebSocket", e);
            throw e;
        }
    }
    
    private TicketTemplateDTO getTemplateForArea(String areaId) {
        try {
            if (areaId != null && !areaId.trim().isEmpty()) {
                logger.info("🔍 Buscando plantilla para área: '{}'", areaId);
                TicketTemplateDTO template = ticketTemplateService.getTemplateByArea(areaId);
                if (template != null) {
                    logger.info("✅ Plantilla encontrada para área '{}': '{}' con {} bloques", 
                        areaId, template.getName(), template.getBlocks() != null ? template.getBlocks().size() : 0);
                } else {
                    logger.warn("❌ No se encontró plantilla para el área: '{}'", areaId);
                }
                return template;
            } else {
                logger.warn("⚠️ AreaId es null o vacío: '{}'", areaId);
            }
        } catch (Exception e) {
            logger.error("❌ Error obteniendo plantilla para el área '{}': {}", areaId, e.getMessage(), e);
        }
        return null;
    }
}