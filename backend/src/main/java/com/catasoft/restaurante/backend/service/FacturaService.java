package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.ComandaItemResponseDTO;
import com.catasoft.restaurante.backend.dto.FacturaResponseDTO;
import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.Factura;
import com.catasoft.restaurante.backend.repository.FacturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacturaService {

    private final FacturaRepository facturaRepository;

    public FacturaService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }

    @Transactional(readOnly = true)
    public List<FacturaResponseDTO> getAllFacturas() {
        return facturaRepository.findAll().stream()
                .map(this::mapToFacturaResponseDTO)
                .collect(Collectors.toList());
    }

    private FacturaResponseDTO mapToFacturaResponseDTO(Factura factura) {
        FacturaResponseDTO dto = new FacturaResponseDTO();
        dto.setId(factura.getId());
        dto.setComandaId(factura.getComanda().getId());
        dto.setNumeroMesa(factura.getComanda().getMesa().getNumero());
        dto.setTotal(factura.getTotal());
        dto.setImpuesto(factura.getImpuesto());
        dto.setFechaEmision(factura.getFechaEmision());
    
        // --- LÓGICA AÑADIDA PARA INCLUIR LOS ITEMS ---
        List<ComandaItemResponseDTO> itemDTOs = factura.getComanda().getItems().stream().map(item -> {
            ComandaItemResponseDTO itemDTO = new ComandaItemResponseDTO();
            itemDTO.setProductoId(item.getProducto().getId());
            itemDTO.setProductoNombre(item.getProducto().getNombre());
            itemDTO.setCantidad(item.getCantidad());
            itemDTO.setPrecioUnitario(item.getPrecioUnitario());
            return itemDTO;
        }).collect(Collectors.toList());
        dto.setItems(itemDTOs);
        // ---------------------------------------------
    
        return dto;
    }
    // Dentro de la clase FacturaService
@Transactional(readOnly = true)
public List<FacturaResponseDTO> getFacturasByDateRange(LocalDate fechaInicio, LocalDate fechaFin) {
    LocalDateTime inicioDelDia = fechaInicio.atStartOfDay();
    LocalDateTime finDelDia = fechaFin.atTime(LocalTime.MAX);
    return facturaRepository.findByFechaEmisionBetween(inicioDelDia, finDelDia).stream()
            .map(this::mapToFacturaResponseDTO)
            .collect(Collectors.toList());
}
// Este método devuelve la Entidad, no el DTO, porque el PdfService la necesitará completa.
public Factura getFacturaEntityById(Long id) {
    return facturaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada con id: " + id));
}
}