package com.catasoft.restaurante.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TicketDTO(
        Long comandaId,
        String nombreMesa,
        LocalDateTime fechaHora,
        List<TicketItemDTO> items,
        BigDecimal total
) {}