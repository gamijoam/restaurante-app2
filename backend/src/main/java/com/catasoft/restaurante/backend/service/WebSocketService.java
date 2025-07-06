package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
@Service
public class WebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendPrintJob(PrintJobDTO printJob) {
        try {
            String destination = "/topic/print-jobs";
            messagingTemplate.convertAndSend(destination, printJob);
            logger.info("Trabajo de impresión enviado a [{}]. Destino: {}", printJob.printerType(), printJob.printerTarget());
        } catch (Exception e) {
            logger.error("Error al enviar el trabajo de impresión por WebSocket", e);
        }
    }
}