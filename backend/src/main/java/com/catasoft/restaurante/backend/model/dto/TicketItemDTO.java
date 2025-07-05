package com.catasoft.restaurante.backend.model.dto;

import java.math.BigDecimal;

public record TicketItemDTO(
        Integer cantidad,
        String nombreProducto,
        BigDecimal precioUnitario,
        BigDecimal precioTotal
) {}