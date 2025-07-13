package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.ComandaArea;
import com.catasoft.restaurante.backend.model.ComandaAreaItem;
import com.catasoft.restaurante.backend.model.ComandaArea.EstadoComandaArea;
import com.catasoft.restaurante.backend.model.PreparationArea;
import com.catasoft.restaurante.backend.repository.ComandaAreaRepository;
import com.catasoft.restaurante.backend.repository.ComandaAreaItemRepository;
import com.catasoft.restaurante.backend.repository.PreparationAreaRepository;
import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.repository.ComandaRepository;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.catasoft.restaurante.backend.dto.ComandaAreaResponseDTO;
import com.catasoft.restaurante.backend.dto.ComandaItemResponseDTO;
import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
import com.catasoft.restaurante.backend.service.WebSocketService;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.Map;
import com.catasoft.restaurante.backend.service.PrinterConfigurationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import com.catasoft.restaurante.backend.dto.TicketTemplateDTO;
import com.catasoft.restaurante.backend.service.TicketTemplateService;

@Service
public class ComandaAreaService {
    private static final Logger log = LoggerFactory.getLogger(ComandaAreaService.class);

    @Autowired
    private ComandaAreaRepository comandaAreaRepository;
    @Autowired
    private ComandaAreaItemRepository comandaAreaItemRepository;
    @Autowired
    private PreparationAreaRepository preparationAreaRepository;
    @Autowired
    private ComandaRepository comandaRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private PrinterConfigurationService printerConfigService;
    @Autowired
    private TicketTemplateService ticketTemplateService;

    public List<ComandaArea> findAll() {
        return comandaAreaRepository.findAll();
    }

    public Optional<ComandaArea> findById(Long id) {
        return comandaAreaRepository.findById(id);
    }

    public List<ComandaArea> findByAreaIdAndStatus(String areaId, EstadoComandaArea status) {
        return comandaAreaRepository.findByAreaIdAndStatus(areaId, status);
    }

    public ComandaArea save(ComandaArea ca) {
        return comandaAreaRepository.save(ca);
    }

    public void delete(Long id) {
        comandaAreaRepository.deleteById(id);
    }

    // --- Items ---
    public List<ComandaAreaItem> findItemsByComandaAreaId(Long comandaAreaId) {
        return comandaAreaItemRepository.findByComandaAreaId(comandaAreaId);
    }

    public ComandaAreaItem saveItem(ComandaAreaItem item) {
        return comandaAreaItemRepository.save(item);
    }

    public void deleteItem(Long id) {
        comandaAreaItemRepository.deleteById(id);
    }

    public List<ComandaAreaResponseDTO> getComandasPorArea(Long areaId) {
        log.debug("Buscando comandas para área ID: {}", areaId);
        
        // Primero, obtener el areaId string correspondiente al ID numérico
        Optional<PreparationArea> area = preparationAreaRepository.findById(areaId);
        if (!area.isPresent()) {
            log.warn("Área no encontrada para ID: {}", areaId);
            return List.of();
        }
        
        String areaIdString = area.get().getAreaId();
        log.debug("Buscando comandas para área string: {}", areaIdString);
        
        // Filtrar comandas que no están entregadas, listas, y que no son ventas rápidas (mesa fantasma)
        List<ComandaArea> comandas = comandaAreaRepository.findByAreaIdAndStatusNotIn(areaIdString, List.of(EstadoComandaArea.DELIVERED, EstadoComandaArea.READY))
            .stream()
            .filter(ca -> {
                // Excluir ventas rápidas (mesa fantasma - mesaId 9999 o null)
                Long mesaId = ca.getComanda().getMesa().getId();
                return mesaId != null && mesaId != 9999;
            })
            .collect(Collectors.toList());
        
        System.out.println("Comandas encontradas para área " + areaIdString + " (excluyendo ventas rápidas): " + comandas.size());
        
        for (ComandaArea ca : comandas) {
            System.out.println("Comanda encontrada - ID: " + ca.getId() + 
                             ", AreaId: " + ca.getAreaId() + 
                             ", Status: " + ca.getStatus() +
                             ", MesaId: " + ca.getComanda().getMesa().getId());
        }
        
        List<ComandaAreaResponseDTO> result = comandas.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
        
        System.out.println("DTOs convertidos: " + result.size());
        return result;
    }

    public ComandaAreaResponseDTO convertToResponseDTO(ComandaArea comandaArea) {
        System.out.println("Convirtiendo ComandaArea ID: " + comandaArea.getId());
        
        ComandaAreaResponseDTO dto = new ComandaAreaResponseDTO();
        dto.setId(comandaArea.getId());
        dto.setComandaId(comandaArea.getComanda().getId());
        
        // Buscar el área por areaId string para obtener el ID numérico
        Optional<PreparationArea> area = preparationAreaRepository.findByAreaId(comandaArea.getAreaId());
        if (area.isPresent()) {
            dto.setAreaId(area.get().getId());
            dto.setAreaNombre(area.get().getName());
            System.out.println("Nombre de área encontrado: " + area.get().getName());
        } else {
            dto.setAreaId(0L); // Valor por defecto
            dto.setAreaNombre("Área " + comandaArea.getAreaId());
            System.out.println("Área no encontrada para areaId: " + comandaArea.getAreaId());
        }
        
        dto.setMesaId(comandaArea.getComanda().getMesa().getId());
        dto.setEstado(comandaArea.getStatus().name());
        dto.setFechaCreacion(comandaArea.getCreatedAt().toString());
        
        // Convertir items
        List<ComandaAreaItem> items = comandaAreaItemRepository.findByComandaAreaId(comandaArea.getId());
        System.out.println("Items encontrados para ComandaArea " + comandaArea.getId() + ": " + items.size());
        
        dto.setItems(items.stream()
            .map(this::convertItemToDTO)
            .collect(Collectors.toList()));
        
        System.out.println("DTO convertido exitosamente para ComandaArea ID: " + comandaArea.getId());
        return dto;
    }

    private ComandaAreaResponseDTO.ComandaAreaItemDTO convertItemToDTO(ComandaAreaItem item) {
        ComandaAreaResponseDTO.ComandaAreaItemDTO dto = new ComandaAreaResponseDTO.ComandaAreaItemDTO();
        dto.setId(item.getId());
        dto.setProductoId(item.getProducto().getId());
        dto.setProductoNombre(item.getProducto().getNombre());
        dto.setCantidad(item.getQuantity());
        dto.setObservaciones(item.getNotes());
        
        // Marcar como nuevo si el item fue creado después de la fecha de creación de la comanda
        Comanda comanda = item.getComandaArea().getComanda();
        LocalDateTime fechaCreacionComanda = comanda.getFechaHoraCreacion();
        
        System.out.println("=== DEBUG ITEM NUEVO ===");
        System.out.println("Item: " + item.getProducto().getNombre());
        System.out.println("Fecha creación item: " + item.getCreatedAt());
        System.out.println("Fecha creación comanda: " + fechaCreacionComanda);
        
        // Un item es nuevo si fue creado más de 1 minuto después de la creación de la comanda
        if (item.getCreatedAt() != null && fechaCreacionComanda != null && 
            item.getCreatedAt().isAfter(fechaCreacionComanda.plusMinutes(1))) {
            dto.setEsNuevo(true);
            System.out.println("Item marcado como NUEVO: " + item.getProducto().getNombre());
        } else {
            dto.setEsNuevo(false);
            System.out.println("Item NO marcado como nuevo: " + item.getProducto().getNombre());
        }
        
        return dto;
    }

    // --- Métodos para cambio de estado ---
    public ComandaArea startPreparation(Long comandaAreaId) {
        ComandaArea comandaArea = comandaAreaRepository.findById(comandaAreaId)
            .orElseThrow(() -> new RuntimeException("ComandaArea no encontrada"));
        
        comandaArea.startPreparation();
        return comandaAreaRepository.save(comandaArea);
    }

    public ComandaArea markAsReady(Long comandaAreaId) {
        ComandaArea comandaArea = comandaAreaRepository.findById(comandaAreaId)
            .orElseThrow(() -> new RuntimeException("ComandaArea no encontrada"));
        
        comandaArea.markAsReady();
        comandaAreaRepository.save(comandaArea);
        
        // Verificar si todas las áreas de la comanda están listas
        Long comandaId = comandaArea.getComanda().getId();
        List<ComandaArea> areas = comandaAreaRepository.findByComandaId(comandaId);
        boolean todasListas = areas.stream().allMatch(a -> a.getStatus() == EstadoComandaArea.READY);
        
        System.out.println("Comanda ID: " + comandaId + ", Total áreas: " + areas.size() + ", Todas listas: " + todasListas);
        
        if (todasListas) {
            // Marcar la comanda principal como LISTA y notificar a caja
            Comanda comanda = comandaArea.getComanda();
            comanda.setEstado(EstadoComanda.LISTA);
            comanda.setFechaUltimaLista(LocalDateTime.now());
            comandaRepository.save(comanda);
            
            // Notificar a caja vía WebSocket
            ComandaResponseDTO dto = mapToComandaResponseDTO(comanda);
            messagingTemplate.convertAndSend("/topic/caja", dto);
            messagingTemplate.convertAndSend("/topic/general", dto);
            
            System.out.println("Comanda principal marcada como LISTA y notificada a caja");
        }
        
        return comandaArea;
    }

    public ComandaArea markAsDelivered(Long comandaAreaId) {
        ComandaArea comandaArea = comandaAreaRepository.findById(comandaAreaId)
            .orElseThrow(() -> new RuntimeException("ComandaArea no encontrada"));
        
        comandaArea.markAsDelivered();
        return comandaAreaRepository.save(comandaArea);
    }

    private ComandaResponseDTO mapToComandaResponseDTO(Comanda comanda) {
        ComandaResponseDTO dto = new ComandaResponseDTO();
        dto.setId(comanda.getId());
        dto.setNumeroMesa(comanda.getMesa().getNumero());
        dto.setEstado(comanda.getEstado());
        dto.setFechaHoraCreacion(comanda.getFechaHoraCreacion());
        dto.setTotal(comanda.getTotal());
        
        // Convertir items
        dto.setItems(comanda.getItems().stream().map(item -> {
            ComandaItemResponseDTO itemDTO = new ComandaItemResponseDTO();
            itemDTO.setProductoId(item.getProducto().getId());
            itemDTO.setProductoNombre(item.getProducto().getNombre());
            itemDTO.setCantidad(item.getCantidad());
            itemDTO.setPrecioUnitario(item.getPrecioUnitario());
            return itemDTO;
        }).collect(Collectors.toList()));
        
        return dto;
    }

    public void imprimirComandaArea(Long comandaAreaId) {
        ComandaArea comandaArea = comandaAreaRepository.findById(comandaAreaId)
            .orElseThrow(() -> new RuntimeException("Comanda de área no encontrada"));
        PrintJobDTO printJob = construirPrintJobDesdeComandaArea(comandaArea);
        webSocketService.sendPrintJob(printJob);
    }

    private PrintJobDTO construirPrintJobDesdeComandaArea(ComandaArea comandaArea) {
        String area = comandaArea.getAreaId();
        String printerType = "COCINA";
        String printerTarget = "default";
        Long templateId = null;
        if (area != null) {
            Optional<com.catasoft.restaurante.backend.model.PrinterConfiguration> configOpt = printerConfigService.getConfigurationByArea(area);
            if (configOpt.isPresent()) {
                var config = configOpt.get();
                printerType = config.getPrinterType();
                printerTarget = config.getPrinterTarget();
                templateId = config.getTemplateId();
            }
        }
        String ticketType = "COCINA";
        Map<String, Object> ticketData = new HashMap<>();
        ticketData.put("comandaId", comandaArea.getComanda().getId());
        ticketData.put("nombreMesa", comandaArea.getComanda().getMesa().getNumero());
        ticketData.put("fechaHora", comandaArea.getComanda().getFechaHoraCreacion());
        ticketData.put("area", area); // Agregar el área a los datos del ticket
        
        // Cargar los items explícitamente usando el repositorio
        List<ComandaAreaItem> items = comandaAreaItemRepository.findByComandaAreaId(comandaArea.getId());
        System.out.println("Items encontrados para impresión en área " + area + ": " + items.size());
        
        List<Map<String, Object>> itemsList = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        
        for (ComandaAreaItem item : items) {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("cantidad", item.getQuantity());
            itemMap.put("nombreProducto", item.getProducto().getNombre());
            itemMap.put("notas", item.getNotes());
            
            // Calcular precio total del item
            BigDecimal precioTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            itemMap.put("precioTotal", precioTotal);
            total = total.add(precioTotal);
            
            itemsList.add(itemMap);
            System.out.println("Item agregado: " + item.getQuantity() + "x " + item.getProducto().getNombre() + " - $" + precioTotal);
        }
        
        ticketData.put("items", itemsList);
        ticketData.put("total", total);
        
        System.out.println("Datos del ticket para impresión: " + ticketData);
        System.out.println("Área: " + area + ", Total: $" + total);
        
        // Buscar la plantilla asignada a la impresora, o la por defecto del área
        TicketTemplateDTO template = null;
        if (templateId != null) {
            template = ticketTemplateService.getTemplateById(templateId);
            if (template != null) {
                System.out.println("Plantilla personalizada encontrada para impresora: " + template.getName());
            } else {
                System.out.println("No se encontró la plantilla personalizada, usando la por defecto del área");
                template = ticketTemplateService.getTemplateByArea(area);
            }
        } else {
            template = ticketTemplateService.getTemplateByArea(area);
        }
        
        return new PrintJobDTO(printerType, printerTarget, ticketType, ticketData, area, template);
    }
} 