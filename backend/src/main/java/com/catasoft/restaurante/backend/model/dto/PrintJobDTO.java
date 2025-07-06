package com.catasoft.restaurante.backend.model.dto;

import com.catasoft.restaurante.backend.model.PrinterConfiguration;

// Este DTO ahora contiene las instrucciones exactas para el Puente de Impresión.
public record PrintJobDTO(
    String printerType,
    String printerTarget,
    String ticketType, // "CAJA" o "COCINA"
    Object ticketData // Puede ser TicketDTO o CocinaTicketDTO
) {
    /**
     * Constructor para tickets de caja
     */
    public PrintJobDTO(PrinterConfiguration config, TicketDTO ticketData) {
        this(config.getPrinterType(), config.getPrinterTarget(), "CAJA", ticketData);
    }
    
    /**
     * Constructor para tickets de cocina
     */
    public PrintJobDTO(PrinterConfiguration config, CocinaTicketDTO ticketData) {
        this(config.getPrinterType(), config.getPrinterTarget(), "COCINA", ticketData);
    }
}