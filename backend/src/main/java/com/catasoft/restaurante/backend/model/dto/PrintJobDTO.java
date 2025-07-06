package com.catasoft.restaurante.backend.model.dto;

import com.catasoft.restaurante.backend.model.PrinterConfiguration;

// Este DTO ahora contiene las instrucciones exactas para el Puente de Impresión.
public record PrintJobDTO(
    String printerType,
    String printerTarget,
    TicketDTO ticketData
) {
    /**
     * Constructor adicional para crear fácilmente un PrintJob a partir de una entidad
     * de configuración y los datos del ticket.
     */
    public PrintJobDTO(PrinterConfiguration config, TicketDTO ticketData) {
        this(config.getPrinterType(), config.getPrinterTarget(), ticketData);
    }
}