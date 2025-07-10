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
import com.catasoft.restaurante.backend.model.dto.CocinaTicketDTO;
import com.catasoft.restaurante.backend.model.dto.CocinaItemDTO;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.*;
import com.catasoft.restaurante.backend.service.SystemConfigService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Arrays;

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
    private final UsuarioRepository usuarioRepository;
    private final SystemConfigService systemConfigService;
    private final ProductAreaRepository productAreaRepository;
    private final ComandaAreaRepository comandaAreaRepository;
    private final ComandaAreaItemRepository comandaAreaItemRepository;
    private final ComandaAreaService comandaAreaService;

    @Autowired
    public ComandaService(
            ComandaRepository comandaRepository,
            MesaRepository mesaRepository,
            ProductoRepository productoRepository,
            SimpMessagingTemplate messagingTemplate,
            FacturaRepository facturaRepository,
            InventarioService inventarioService,
            WebSocketService webSocketService,
            PrinterConfigurationService printerConfigService,
            UsuarioRepository usuarioRepository,
            SystemConfigService systemConfigService,
            ProductAreaRepository productAreaRepository,
            ComandaAreaRepository comandaAreaRepository,
            ComandaAreaItemRepository comandaAreaItemRepository,
            ComandaAreaService comandaAreaService) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
        this.productoRepository = productoRepository;
        this.messagingTemplate = messagingTemplate;
        this.facturaRepository = facturaRepository;
        this.inventarioService = inventarioService;
        this.webSocketService = webSocketService;
        this.printerConfigService = printerConfigService;
        this.usuarioRepository = usuarioRepository;
        this.systemConfigService = systemConfigService;
        this.productAreaRepository = productAreaRepository;
        this.comandaAreaRepository = comandaAreaRepository;
        this.comandaAreaItemRepository = comandaAreaItemRepository;
        this.comandaAreaService = comandaAreaService;
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
            itemDTO.setItemPrincipalId(item.getItemPrincipal() != null ? item.getItemPrincipal().getId() : null);
            // Marcar esNuevo si el item fue agregado después de la última vez que la comanda fue LISTA
            LocalDateTime fechaUltimaLista = comanda.getFechaUltimaLista();
            if (fechaUltimaLista != null && item.getFechaAgregado() != null && item.getFechaAgregado().isAfter(fechaUltimaLista)) {
                itemDTO.setEsNuevo(true);
            } else {
                itemDTO.setEsNuevo(false);
            }
            return itemDTO;
        }).collect(Collectors.toList()));
        return dto;
    }

    // --- RESTO DE LA CLASE (SIN CAMBIOS) ---

    @Transactional
    public ComandaResponseDTO crearComanda(ComandaRequestDTO request) {
        // Obtener el usuario actual del SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado: " + username));

        Mesa mesa = mesaRepository.findById(request.getMesaId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + request.getMesaId()));

        if (mesa.getEstado() != EstadoMesa.LIBRE) {
            throw new IllegalStateException("La mesa " + mesa.getNumero() + " no está libre.");
        }

        Comanda comanda = new Comanda();
        comanda.setMesa(mesa);
        comanda.setUsuario(usuario);
        comanda.setFechaHoraCreacion(LocalDateTime.now());
        comanda.setFechaModificacion(LocalDateTime.now());
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
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad()));
            comandaItem.setSubtotal(subtotal);
            comandaItem.setComanda(comanda);
            comanda.getItems().add(comandaItem);

            totalComanda = totalComanda.add(subtotal);
        }
        comanda.setTotal(totalComanda);
        Comanda comandaGuardada = comandaRepository.save(comanda);
        // Al crear la comanda, actualizar y notificar la mesa
        mesa.setEstado(EstadoMesa.OCUPADA);
        mesaRepository.save(mesa);
        messagingTemplate.convertAndSend("/topic/mesas", mesa);

        // --- ELIMINAR impresión automática de cocina aquí ---
        // Solo notificar a cocina si no es una venta rápida
        if (request.getMesaId() == null || request.getMesaId() != 9999) {
            logger.info("Enviando notificación a /topic/cocina para nueva comanda ID: {}", comandaGuardada.getId());
            messagingTemplate.convertAndSend("/topic/cocina", mapToComandaResponseDTO(comandaGuardada));
        } else {
            logger.info("Venta rápida detectada, saltando notificaciones a cocina");
        }
        logger.info("Enviando notificación a /topic/mesas para actualizar estado de mesa: {}", mesa.getNumero());
        messagingTemplate.convertAndSend("/topic/mesas", "Mesa " + mesa.getNumero() + " actualizada a OCUPADA");
        return mapToComandaResponseDTO(comandaGuardada);
    }

    /**
     * Divide una comanda por áreas de preparación y crea comandas específicas por área
     */
    @Transactional
    public void dividirComandaPorAreas(Long comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + comandaId));

        logger.info("Iniciando división de comanda ID: {} con {} items", comandaId, comanda.getItems().size());

        // Agrupar items por área de preparación
        Map<String, List<ComandaItem>> itemsPorArea = comanda.getItems().stream()
                .collect(Collectors.groupingBy(item -> {
                    // Buscar la asignación producto-área
                    List<ProductArea> asignaciones = productAreaRepository.findByProductoId(item.getProducto().getId());
                    logger.info("Producto ID: {}, Nombre: {}, Categoría: {}, Asignaciones encontradas: {}", 
                            item.getProducto().getId(), 
                            item.getProducto().getNombre(), 
                            item.getProducto().getCategoria(),
                            asignaciones.size());
                    
                    // Mostrar todas las asignaciones encontradas
                    for (ProductArea pa : asignaciones) {
                        logger.info("  - Asignación: Producto {} -> Área {}", pa.getProducto().getNombre(), pa.getAreaId());
                    }
                    
                    String areaId = asignaciones.stream()
                            .findFirst()
                            .map(productArea -> productArea.getAreaId())
                            .orElse("sin-asignar");
                    
                    logger.info("Producto {} asignado a área: {}", item.getProducto().getNombre(), areaId);
                    return areaId;
                }));

        logger.info("Items agrupados por área: {}", itemsPorArea.keySet());

        // Crear comandas por área
        for (Map.Entry<String, List<ComandaItem>> entry : itemsPorArea.entrySet()) {
            String areaId = entry.getKey();
            List<ComandaItem> items = entry.getValue();

            if ("sin-asignar".equals(areaId)) {
                logger.warn("Items sin asignación de área encontrados para comanda ID: {}", comandaId);
                continue;
            }

            logger.info("Creando comanda por área: Área: {}, Items: {}", areaId, items.size());

            // Crear comanda por área
            ComandaArea comandaArea = new ComandaArea();
            comandaArea.setComanda(comanda);
            comandaArea.setAreaId(areaId);
            comandaArea.setStatus(ComandaArea.EstadoComandaArea.PENDING);
            comandaArea.setCreatedAt(LocalDateTime.now());
            comandaArea.setUpdatedAt(LocalDateTime.now());

            ComandaArea comandaAreaGuardada = comandaAreaRepository.save(comandaArea);
            logger.info("Comanda por área creada con ID: {}", comandaAreaGuardada.getId());

            // Crear items de comanda por área
            for (ComandaItem item : items) {
                ComandaAreaItem areaItem = new ComandaAreaItem();
                areaItem.setComandaArea(comandaAreaGuardada);
                areaItem.setProducto(item.getProducto());
                areaItem.setQuantity(item.getCantidad());
                areaItem.setUnitPrice(item.getPrecioUnitario());
                areaItem.setStatus(ComandaAreaItem.EstadoItem.PENDING);
                areaItem.setCreatedAt(LocalDateTime.now());
                areaItem.setUpdatedAt(LocalDateTime.now());

                ComandaAreaItem itemGuardado = comandaAreaItemRepository.save(areaItem);
                logger.info("Item de comanda por área creado: Producto: {}, Cantidad: {}, ID: {}", 
                        item.getProducto().getNombre(), item.getCantidad(), itemGuardado.getId());
            }

            logger.info("Comanda por área completada: Comanda ID: {}, Área: {}, Items: {}", 
                    comandaId, areaId, items.size());
        }
    }

    /**
     * Crea comanda y automáticamente la divide por áreas
     */
    @Transactional
    public ComandaResponseDTO crearComandaConDivisionPorAreas(ComandaRequestDTO request) {
        // Crear la comanda principal
        ComandaResponseDTO comandaResponse = crearComanda(request);
        // Solo dividir por áreas si no es una venta rápida (mesa fantasma)
        if (request.getMesaId() != null && request.getMesaId() != 9999) {
            dividirComandaPorAreas(comandaResponse.getId());
            // --- NUEVO: Imprimir un ticket por cada área creada ---
            List<ComandaArea> areas = comandaAreaRepository.findByComandaId(comandaResponse.getId());
            for (ComandaArea area : areas) {
                try {
                    comandaAreaService.imprimirComandaArea(area.getId());
                } catch (Exception e) {
                    logger.error("Error imprimiendo ticket para área {} de comanda {}: {}", area.getAreaId(), area.getComanda().getId(), e.getMessage());
                }
            }
        } else {
            logger.info("Venta rápida detectada (mesaId: {}), saltando división por áreas", request.getMesaId());
        }
        return comandaResponse;
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

    // --- MÉTODO PARA TICKETS DE COCINA (VERSIÓN SIMPLIFICADA) ---
    @Transactional(readOnly = true)
    public CocinaTicketDTO getCocinaTicketData(Long comandaId) {
        logger.info("Iniciando getCocinaTicketData para la comanda ID: {}", comandaId);

        Comanda comanda = comandaRepository.findByIdWithDetails(comandaId)
                .orElseThrow(() -> new EntityNotFoundException("Comanda no encontrada o sin detalles: " + comandaId));

        logger.info("Comanda encontrada para cocina. Verificando datos de la mesa...");

        Mesa mesa = comanda.getMesa();
        logger.info("Mesa encontrada - ID: {}, Número: {}, Nombre: '{}'", mesa.getId(), mesa.getNumero(), mesa.getNombre());
        
        // Determinar el nombre para el ticket de cocina
        String nombreParaTicket;
        if (mesa.getNombre() != null && !mesa.getNombre().trim().isEmpty()) {
            nombreParaTicket = mesa.getNombre();
            logger.info("Usando nombre personalizado de la mesa: '{}'", nombreParaTicket);
        } else {
            nombreParaTicket = "Mesa " + mesa.getNumero();
            logger.info("Usando número de mesa como nombre: '{}'", nombreParaTicket);
        }
        
        logger.info("Procesando {} items para cocina", comanda.getItems().size());
        List<CocinaItemDTO> itemsDTO = comanda.getItems().stream()
                .map(comandaItem -> {
                    logger.info("Item para cocina: {} x {}", comandaItem.getCantidad(), 
                              comandaItem.getProducto().getNombre());
                    return new CocinaItemDTO(
                            comandaItem.getCantidad(),
                            comandaItem.getProducto().getNombre(),
                            "" // Por ahora sin notas, pero se puede expandir en el futuro
                    );
                }).collect(Collectors.toList());

        CocinaTicketDTO cocinaTicketDTO = new CocinaTicketDTO(
                comanda.getId(),
                nombreParaTicket,
                comanda.getFechaHoraCreacion(),
                itemsDTO
        );
        
        logger.info("CocinaTicketDTO creado - ComandaID: {}, Mesa: '{}', Items: {}", 
                   cocinaTicketDTO.comandaId(), cocinaTicketDTO.nombreMesa(), cocinaTicketDTO.items().size());
        
        return cocinaTicketDTO;
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

        if (nuevoEstado == EstadoComanda.LISTA) {
            comanda.setFechaUltimaLista(LocalDateTime.now());
        }

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
            messagingTemplate.convertAndSend("/topic/mesas", mesa);
        }

        if (nuevoEstado == EstadoComanda.PAGADA) {
            if (comanda.getEstado() == EstadoComanda.PAGADA || comanda.getEstado() == EstadoComanda.CANCELADA) {
                throw new IllegalStateException("No se puede pagar una comanda que ya está pagada o cancelada.");
            }

            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
            mesaRepository.save(mesa);
            messagingTemplate.convertAndSend("/topic/mesas", mesa);

            // Crear factura con todos los campos obligatorios
            Factura factura = new Factura();
            factura.setComanda(comanda);
            factura.setNumeroFactura("FAC-" + System.currentTimeMillis()); // Generar número único
            factura.setSubtotal(comanda.getTotal()); // El subtotal es el total sin impuestos
            BigDecimal impuestoRate = systemConfigService.getImpuesto();
            BigDecimal impuesto = comanda.getTotal().multiply(impuestoRate);
            factura.setImpuesto(impuesto);
            factura.setTotal(comanda.getTotal().add(impuesto));
            factura.setMetodoPago("EFECTIVO"); // Por defecto efectivo, se puede cambiar después
            facturaRepository.save(factura);
            logger.info("Factura creada con ID: {} para la comanda ID: {}", factura.getId(), comanda.getId());
        }

        if (nuevoEstado == EstadoComanda.LISTA || nuevoEstado == EstadoComanda.ENTREGADA) {
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LISTA_PARA_PAGAR);
            mesaRepository.save(mesa);
            messagingTemplate.convertAndSend("/topic/mesas", mesa);
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
            Mesa mesaActualizada = mesaRepository.findById(comanda.getMesa().getId()).orElseThrow();
            messagingTemplate.convertAndSend("/topic/mesas", mesaActualizada);
        }

        // Solo enviar a cocina si la comanda está EN_PROCESO
        if (dto.getEstado().equals("EN_PROCESO")) {
            messagingTemplate.convertAndSend("/topic/cocina", dto);
        }

        return dto;
    }

    @Transactional
    public ComandaResponseDTO agregarItemsAComanda(Long comandaId, List<ItemRequestDTO> itemsRequest) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + comandaId));

        // Permitir agregar productos si la comanda está EN_PROCESO, LISTA o ENTREGADA
        if (comanda.getEstado() != EstadoComanda.EN_PROCESO &&
            comanda.getEstado() != EstadoComanda.LISTA &&
            comanda.getEstado() != EstadoComanda.ENTREGADA) {
            throw new IllegalStateException("Solo se pueden añadir items a una comanda que está EN_PROCESO, LISTA o ENTREGADA.");
        }

        // Si la comanda está LISTA o ENTREGADA, volver a EN_PROCESO
        if (comanda.getEstado() == EstadoComanda.LISTA || comanda.getEstado() == EstadoComanda.ENTREGADA) {
            comanda.setEstado(EstadoComanda.EN_PROCESO);
            // También actualizar el estado de la mesa si es necesario
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.OCUPADA);
            mesaRepository.save(mesa);
            messagingTemplate.convertAndSend("/topic/mesas", mesa);
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
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad()));
            comandaItem.setSubtotal(subtotal);
            comandaItem.setComanda(comanda);
            comandaItem.setFechaAgregado(LocalDateTime.now());
            // Asociar adicional si corresponde
            if (itemDTO.getItemPrincipalId() != null) {
                ComandaItem itemPrincipal = comanda.getItems().stream()
                        .filter(i -> i.getId() != null && i.getId().equals(itemDTO.getItemPrincipalId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Item principal no encontrado con id: " + itemDTO.getItemPrincipalId()));
                comandaItem.setItemPrincipal(itemPrincipal);
            }
            comanda.getItems().add(comandaItem);

            comanda.setTotal(comanda.getTotal().add(subtotal));
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
        // Buscar la comanda más reciente en estado EN_PROCESO, LISTA o ENTREGADA
        List<EstadoComanda> estadosActivos = Arrays.asList(EstadoComanda.EN_PROCESO, EstadoComanda.LISTA, EstadoComanda.ENTREGADA);
        return comandaRepository.findByEstadoIn(estadosActivos).stream()
                .filter(c -> c.getMesa().getId().equals(mesaId))
                .sorted((c1, c2) -> c2.getFechaHoraCreacion().compareTo(c1.getFechaHoraCreacion()))
                .findFirst()
                .map(this::mapToComandaResponseDTO);
    }
}