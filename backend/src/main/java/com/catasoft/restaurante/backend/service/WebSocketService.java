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
            // Obtener la plantilla correspondiente al área
            TicketTemplateDTO template = getTemplateForArea(printJob.area());
            
            // Crear un nuevo PrintJobDTO con la plantilla incluida
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
            logger.info("Trabajo de impresión enviado a [{}]. Destino: {}, Área: {}", 
                printJob.printerType(), printJob.printerTarget(), printJob.area());
        } catch (Exception e) {
            logger.error("Error al enviar el trabajo de impresión por WebSocket", e);
        }
    }
    
    private TicketTemplateDTO getTemplateForArea(String areaId) {
        try {
            if (areaId != null && !areaId.trim().isEmpty()) {
                return ticketTemplateService.getTemplateByArea(areaId);
            }
        } catch (Exception e) {
            logger.warn("No se pudo obtener la plantilla para el área: {}", areaId, e);
        }
        return null;
    }
}