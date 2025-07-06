package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.ComandaItemResponseDTO;
import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.dto.ItemRequestDTO;
import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.*;
import com.catasoft.restaurante.backend.model.dto.PrintJobDTO;
import com.catasoft.restaurante.backend.model.dto.TicketDTO;
import com.catasoft.restaurante.backend.model.dto.TicketItemDTO;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ComandaService {

    private static final Logger logger = LoggerFactory.getLogger(ComandaService.class);

    private final ComandaRepository comandaRepository;
    private final MesaRepository mesaRepository;
    private final ProductoRepository productoRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FacturaRepository facturaRepository;
    private final InventarioService inventarioService;
    private final WebSocketService webSocketService;
    private final PrinterConfigurationService printerConfigService;

    @Autowired
    public ComandaService(
            ComandaRepository comandaRepository,
            MesaRepository mesaRepository,
            ProductoRepository productoRepository,
            SimpMessagingTemplate messagingTemplate,
            FacturaRepository facturaRepository,
            InventarioService inventarioService,
            WebSocketService webSocketService,
            PrinterConfigurationService printerConfigService) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
        this.productoRepository = productoRepository;
        this.messagingTemplate = messagingTemplate;
        this.facturaRepository = facturaRepository;
        this.inventarioService = inventarioService;
        this.webSocketService = webSocketService;
        this.printerConfigService = printerConfigService;
    }

    // --- MÉTODO MAPPER RESTAURADO A SU FORMA ORIGINAL Y CORRECTA ---
    private ComandaResponseDTO mapToComandaResponseDTO(Comanda comanda) {
        ComandaResponseDTO dto = new ComandaResponseDTO();
        dto.setId(comanda.getId());

        // --- CORRECCIÓN AQUÍ ---
        // Usamos el número de la mesa, que es lo que el DTO espera.
        dto.setNumeroMesa(comanda.getMesa().getNumero());

        dto.setEstado(comanda.getEstado());
        dto.setFechaHoraCreacion(comanda.getFechaHoraCreacion());
        dto.setTotal(comanda.getTotal());
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

    // --- RESTO DE LA CLASE (SIN CAMBIOS) ---

    @Transactional
    public ComandaResponseDTO crearComanda(ComandaRequestDTO request) {
        Mesa mesa = mesaRepository.findById(request.getMesaId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + request.getMesaId()));

        if (mesa.getEstado() != EstadoMesa.LIBRE) {
            throw new IllegalStateException("La mesa " + mesa.getNumero() + " no está libre.");
        }

        Comanda comanda = new Comanda();
        comanda.setMesa(mesa);
        comanda.setFechaHoraCreacion(LocalDateTime.now());
        comanda.setEstado(EstadoComanda.EN_PROCESO);
        BigDecimal totalComanda = BigDecimal.ZERO;

        for (ItemRequestDTO itemDTO : request.getItems()) {
            Producto producto = productoRepository.findById(itemDTO.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + itemDTO.getProductoId()));

            inventarioService.validarStockIngredientes(producto, itemDTO.getCantidad());
            inventarioService.descontarStockIngredientes(producto, itemDTO.getCantidad());

            ComandaItem comandaItem = new ComandaItem();
            comandaItem.setProducto(producto);
            comandaItem.setCantidad(itemDTO.getCantidad());
            comandaItem.setPrecioUnitario(producto.getPrecio());
            comandaItem.setComanda(comanda);
            comanda.getItems().add(comandaItem);

            totalComanda = totalComanda.add(producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad())));
        }
        comanda.setTotal(totalComanda);
        mesa.setEstado(EstadoMesa.OCUPADA);
        Comanda comandaGuardada = comandaRepository.save(comanda);

        try {
            Optional<PrinterConfiguration> configOpt = printerConfigService.getConfigurationByRole("COCINA");
            if (configOpt.isPresent()) {
                TicketDTO ticketData = getTicketData(comandaGuardada.getId());
                PrintJobDTO printJob = new PrintJobDTO(configOpt.get(), ticketData);
                webSocketService.sendPrintJob(printJob);
            } else {
                logger.warn("No se encontró una configuración de impresora para el rol 'COCINA'. Saltando impresión automática.");
            }
        } catch (Exception e) {
            logger.error("Fallo en el proceso de impresión automática para la comanda ID: {}", comandaGuardada.getId(), e);
        }

        ComandaResponseDTO dto = mapToComandaResponseDTO(comandaGuardada);
        logger.info("Enviando notificación a /topic/cocina para nueva comanda ID: {}", dto.getId());
        messagingTemplate.convertAndSend("/topic/cocina", dto);
        logger.info("Enviando notificación a /topic/mesas para actualizar estado de mesa: {}", mesa.getNumero());
        messagingTemplate.convertAndSend("/topic/mesas", "Mesa " + mesa.getNumero() + " actualizada a OCUPADA");

        return dto;
    }

    @Transactional
    public void limpiarItemsComanda(Long comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + comandaId));
        if (comanda.getItems().isEmpty()) return;

        for (ComandaItem item : comanda.getItems()) {
            inventarioService.restaurarStockIngredientes(item.getProducto(), item.getCantidad());
        }

        comanda.getItems().clear();
        comanda.setTotal(BigDecimal.ZERO);
        comandaRepository.save(comanda);
        logger.info("Items limpiados y stock restaurado para la comanda ID: {}", comandaId);
    }

    // --- MÉTODO getTicketData (VERSIÓN FINAL Y CORRECTA) ---
    @Transactional(readOnly = true) // <-- 1. AÑADIMOS ESTA ANOTACIÓN CRUCIAL
    public TicketDTO getTicketData(Long comandaId) {
        logger.info("Iniciando getTicketData para la comanda ID: {}", comandaId);

        Comanda comanda = comandaRepository.findByIdWithDetails(comandaId)
                .orElseThrow(() -> new EntityNotFoundException("Comanda no encontrada o sin detalles: " + comandaId));

        logger.info("Comanda encontrada. Verificando datos de la mesa...");

        Mesa mesa = comanda.getMesa();
        logger.info("Mesa encontrada - ID: {}, Número: {}, Nombre: '{}'", mesa.getId(), mesa.getNumero(), mesa.getNombre());
        
        // --- LA SOLUCIÓN DEFINITIVA ESTÁ AQUÍ ---
        // Verificamos si el nombre de la mesa es nulo o está vacío.
        String nombreParaTicket;
        if (mesa.getNombre() != null && !mesa.getNombre().trim().isEmpty()) {
            // Si tiene un nombre, lo usamos.
            nombreParaTicket = mesa.getNombre();
            logger.info("Usando nombre personalizado de la mesa: '{}'", nombreParaTicket);
        } else {
            // Si no tiene nombre, usamos su número como respaldo.
            nombreParaTicket = "Mesa " + mesa.getNumero();
            logger.info("Usando número de mesa como nombre: '{}'", nombreParaTicket);
        }
        logger.info("Nombre final para el ticket: '{}'", nombreParaTicket);
        
        logger.info("Procesando {} items de la comanda", comanda.getItems().size());
        List<TicketItemDTO> itemsDTO = comanda.getItems().stream()
                .map(comandaItem -> {
                    BigDecimal precioTotalItem = comandaItem.getPrecioUnitario()
                            .multiply(new BigDecimal(comandaItem.getCantidad()));
                    logger.info("Item: {} x {} = ${}", comandaItem.getCantidad(), 
                              comandaItem.getProducto().getNombre(), precioTotalItem);
                    return new TicketItemDTO(
                            comandaItem.getCantidad(),
                            comandaItem.getProducto().getNombre(),
                            comandaItem.getPrecioUnitario(),
                            precioTotalItem
                    );
                }).collect(Collectors.toList());

        TicketDTO ticketDTO = new TicketDTO(
                comanda.getId(),
                nombreParaTicket, // <-- 2. Usamos la variable calculada correctamente
                comanda.getFechaHoraCreacion(),
                itemsDTO,
                comanda.getTotal()
        );
        
        logger.info("TicketDTO creado - ComandaID: {}, Mesa: '{}', Total: ${}, Items: {}", 
                   ticketDTO.comandaId(), ticketDTO.nombreMesa(), ticketDTO.total(), ticketDTO.items().size());
        
        return ticketDTO;
    }

    @Transactional
    public ComandaResponseDTO updateEstadoComanda(Long id, Map<String, String> payload) {
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + id));

        String nuevoEstadoStr = payload.get("estado");
        if (nuevoEstadoStr == null) {
            throw new IllegalArgumentException("El campo 'estado' es requerido.");
        }

        EstadoComanda nuevoEstado = EstadoComanda.valueOf(nuevoEstadoStr.toUpperCase());

        if (nuevoEstado == EstadoComanda.CANCELADA) {
            if (comanda.getEstado() == EstadoComanda.CANCELADA || comanda.getEstado() == EstadoComanda.PAGADA) {
                throw new IllegalStateException("No se puede cancelar una comanda que ya está cancelada o pagada.");
            }
            for (ComandaItem item : comanda.getItems()) {
                inventarioService.restaurarStockIngredientes(item.getProducto(), item.getCantidad());
            }
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
            mesaRepository.save(mesa);
        }

        if (nuevoEstado == EstadoComanda.PAGADA) {
            if (comanda.getEstado() == EstadoComanda.PAGADA || comanda.getEstado() == EstadoComanda.CANCELADA) {
                throw new IllegalStateException("No se puede pagar una comanda que ya está pagada o cancelada.");
            }

            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
            mesaRepository.save(mesa);

            Factura factura = new Factura();
            factura.setComanda(comanda);
            factura.setTotal(comanda.getTotal());
            BigDecimal impuesto = comanda.getTotal().multiply(new BigDecimal("0.16"));
            factura.setImpuesto(impuesto);
            facturaRepository.save(factura);
            logger.info("Factura creada con ID: {} para la comanda ID: {}", factura.getId(), comanda.getId());
        }

        if (nuevoEstado == EstadoComanda.LISTA || nuevoEstado == EstadoComanda.ENTREGADA) {
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LISTA_PARA_PAGAR);
            mesaRepository.save(mesa);
        }

        comanda.setEstado(nuevoEstado);
        Comanda comandaActualizada = comandaRepository.save(comanda);
        ComandaResponseDTO dto = mapToComandaResponseDTO(comandaActualizada);

        messagingTemplate.convertAndSend("/topic/general", dto);
        if (nuevoEstado == EstadoComanda.LISTA || nuevoEstado == EstadoComanda.ENTREGADA) {
            messagingTemplate.convertAndSend("/topic/caja", dto);
        }
        if (nuevoEstado == EstadoComanda.PAGADA || nuevoEstado == EstadoComanda.CANCELADA ||
                nuevoEstado == EstadoComanda.LISTA || nuevoEstado == EstadoComanda.ENTREGADA) {
            String mensaje = "Mesa " + comanda.getMesa().getNumero() + " actualizada a " + comanda.getMesa().getEstado();
            messagingTemplate.convertAndSend("/topic/mesas", mensaje);
        }

        return dto;
    }

    @Transactional
    public ComandaResponseDTO agregarItemsAComanda(Long comandaId, List<ItemRequestDTO> itemsRequest) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + comandaId));

        if (comanda.getEstado() != EstadoComanda.EN_PROCESO) {
            throw new IllegalStateException("Solo se pueden añadir items a una comanda que está EN PROCESO.");
        }

        for (ItemRequestDTO itemDTO : itemsRequest) {
            Producto producto = productoRepository.findById(itemDTO.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + itemDTO.getProductoId()));

            inventarioService.validarStockIngredientes(producto, itemDTO.getCantidad());
            inventarioService.descontarStockIngredientes(producto, itemDTO.getCantidad());

            ComandaItem comandaItem = new ComandaItem();
            comandaItem.setProducto(producto);
            comandaItem.setCantidad(itemDTO.getCantidad());
            comandaItem.setPrecioUnitario(producto.getPrecio());
            comandaItem.setComanda(comanda);
            comanda.getItems().add(comandaItem);

            comanda.setTotal(comanda.getTotal().add(producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad()))));
        }

        Comanda comandaActualizada = comandaRepository.save(comanda);
        ComandaResponseDTO dto = mapToComandaResponseDTO(comandaActualizada);

        messagingTemplate.convertAndSend("/topic/cocina", dto);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<ComandaResponseDTO> getComandasByEstado(EstadoComanda estado) {
        return comandaRepository.findByEstado(estado).stream()
                .map(this::mapToComandaResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComandaResponseDTO> getAllComandas() {
        return comandaRepository.findAll().stream()
                .map(this::mapToComandaResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComandaResponseDTO> getComandasByEstados(List<EstadoComanda> estados) {
        return comandaRepository.findByEstadoIn(estados).stream()
                .map(this::mapToComandaResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComandaResponseDTO getComandaById(Long id) {
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + id));
        return mapToComandaResponseDTO(comanda);
    }

    @Transactional(readOnly = true)
    public Optional<ComandaResponseDTO> getComandaActivaPorMesa(Long mesaId) {
        return comandaRepository
                .findFirstByMesaIdAndEstadoOrderByFechaHoraCreacionDesc(mesaId, EstadoComanda.EN_PROCESO)
                .map(this::mapToComandaResponseDTO);
    }
}