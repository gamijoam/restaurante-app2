package com.catasoft.restaurante.backend.model.dto;

import com.catasoft.restaurante.backend.dto.TicketTemplateDTO;
import com.catasoft.restaurante.backend.model.PrinterConfiguration;

// Este DTO ahora contiene las instrucciones exactas para el Puente de Impresión.
public record PrintJobDTO(
    String printerType,
    String printerTarget,
    String ticketType, // "CAJA" o "COCINA"
    Object ticketData, // Puede ser TicketDTO o CocinaTicketDTO
    String area, // Área de impresión (caja, cocina, barra, etc.)
    TicketTemplateDTO template // Plantilla personalizada para el ticket
) {
    /**
     * Constructor para tickets de caja
     */
    public PrintJobDTO(PrinterConfiguration config, TicketDTO ticketData) {
        this(config.getPrinterType(), config.getPrinterTarget(), "CAJA", ticketData, "caja", null);
    }
    
    /**
     * Constructor para tickets de cocina
     */
    public PrintJobDTO(PrinterConfiguration config, CocinaTicketDTO ticketData) {
        this(config.getPrinterType(), config.getPrinterTarget(), "COCINA", ticketData, "cocina", null);
    }
    
    /**
     * Constructor completo con área y plantilla
     */
    public PrintJobDTO(String printerType, String printerTarget, String ticketType, Object ticketData, String area, TicketTemplateDTO template) {
        this.printerType = printerType;
        this.printerTarget = printerTarget;
        this.ticketType = ticketType;
        this.ticketData = ticketData;
        this.area = area;
        this.template = template;
    }
}