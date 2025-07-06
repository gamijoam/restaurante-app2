package com.catasoft.restaurante.backend.model.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CocinaTicketDTO(
        Long comandaId,
        String nombreMesa,
        LocalDateTime fechaHora,
        List<CocinaItemDTO> items
) {} 