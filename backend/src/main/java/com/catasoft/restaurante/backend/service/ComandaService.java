

package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.ComandaItemResponseDTO;
import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.dto.ItemRequestDTO;
import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.*;
import com.catasoft.restaurante.backend.model.dto.TicketDTO;
import com.catasoft.restaurante.backend.model.dto.TicketItemDTO;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.catasoft.restaurante.backend.model.Factura;
import com.catasoft.restaurante.backend.service.InventarioService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
public class ComandaService {
    /**
     * Elimina todos los ítems de una comanda y restaura el stock de ingredientes.
     */
    @Transactional
    public void limpiarItemsComanda(Long comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + comandaId));
        if (comanda.getItems().isEmpty()) return;
        // Restaurar stock de ingredientes por cada ítem
        for (ComandaItem item : comanda.getItems()) {
            Producto producto = item.getProducto();
            int cantidad = item.getCantidad();
            // Por cada ingrediente de la receta, restaurar stock
            List<RecetaIngrediente> receta = inventarioService.recetaIngredienteRepository.findByProducto(producto);
            for (RecetaIngrediente ri : receta) {
                Ingrediente ing = ri.getIngrediente();
                double devolver = ri.getCantidad() * cantidad;
                ing.setStock(ing.getStock() + devolver);
                inventarioService.ingredienteRepository.save(ing);
            }
        }
        comanda.getItems().clear();
        comanda.setTotal(BigDecimal.ZERO);
        comandaRepository.save(comanda);
    }

    private final ComandaRepository comandaRepository;
    private final MesaRepository mesaRepository;
    private final ProductoRepository productoRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FacturaRepository facturaRepository;
    private final InventarioService inventarioService;

    public ComandaService(ComandaRepository comandaRepository, MesaRepository mesaRepository, ProductoRepository productoRepository, SimpMessagingTemplate messagingTemplate, FacturaRepository facturaRepository, InventarioService inventarioService) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
        this.productoRepository = productoRepository;
        this.messagingTemplate = messagingTemplate;
        this.facturaRepository = facturaRepository;
        this.inventarioService = inventarioService;
    }
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

            // Validar stock de ingredientes
            inventarioService.validarStockIngredientes(producto, itemDTO.getCantidad());

            // Descontar stock de ingredientes
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
        ComandaResponseDTO dto = mapToComandaResponseDTO(comandaGuardada);

        // 3. ENVIAMOS LA NOTIFICACIÓN WEBSOCKET AL CANAL DE LA COCINA
        System.out.println("Enviando notificación a /topic/cocina para nueva comanda ID: " + dto.getId());
        messagingTemplate.convertAndSend("/topic/cocina", dto);

        // 4. ENVIAMOS NOTIFICACIÓN PARA ACTUALIZAR EL ESTADO DE LA MESA
        System.out.println("Enviando notificación a /topic/mesas para actualizar estado de mesa: " + mesa.getNumero());
        messagingTemplate.convertAndSend("/topic/mesas", "Mesa " + mesa.getNumero() + " actualizada a OCUPADA");
        
        // 5. Pequeño delay para asegurar que la notificación se procese
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return dto;
    }
    public TicketDTO getTicketData(Long comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new EntityNotFoundException("Comanda no encontrada con id: " + comandaId));

        List<TicketItemDTO> itemsDTO = comanda.getItems().stream()
                .map(comandaItem -> {
                    // *** INICIO DE LA CORRECCIÓN ***
                    // Calculamos el precio total del ítem al momento, ya que no se guarda en la BD.
                    BigDecimal precioTotalItem = comandaItem.getPrecioUnitario()
                            .multiply(new BigDecimal(comandaItem.getCantidad()));
                    // *** FIN DE LA CORRECCIÓN ***

                    return new TicketItemDTO(
                            comandaItem.getCantidad(),
                            comandaItem.getProducto().getNombre(),
                            comandaItem.getPrecioUnitario(), // Usamos el precio unitario del item
                            precioTotalItem // Usamos el total que acabamos de calcular
                    );
                }).toList();

        return new TicketDTO(
                comanda.getId(),
                comanda.getMesa().getNombre(),
                comanda.getFechaHoraCreacion(),
                itemsDTO,
                comanda.getTotal()
        );
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
            // Permitir cancelar cualquier comanda que NO esté ya cancelada ni pagada
            if (comanda.getEstado() == EstadoComanda.CANCELADA || comanda.getEstado() == EstadoComanda.PAGADA) {
                throw new IllegalStateException("No se puede cancelar una comanda que ya está cancelada o pagada.");
            }
            // Restaurar stock de ingredientes por cada ítem
            for (ComandaItem item : comanda.getItems()) {
                Producto producto = item.getProducto();
                int cantidad = item.getCantidad();
                // Por cada ingrediente de la receta, restaurar stock
                inventarioService.restaurarStockIngredientes(producto, cantidad);
            }
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
        }
    
        // --- LÓGICA DE FACTURACIÓN RESTAURADA ---
        if (nuevoEstado == EstadoComanda.PAGADA) {
            // Permitir pagar cualquier comanda que NO esté ya pagada ni cancelada
            if (comanda.getEstado() == EstadoComanda.PAGADA || comanda.getEstado() == EstadoComanda.CANCELADA) {
                throw new IllegalStateException("No se puede pagar una comanda que ya está pagada o cancelada.");
            }
            
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
            mesaRepository.save(mesa);
    
            // Este bloque estaba faltando:
            Factura factura = new Factura();
            factura.setComanda(comanda);
            factura.setTotal(comanda.getTotal());
            BigDecimal impuesto = comanda.getTotal().multiply(new BigDecimal("0.16")); // Ejemplo de impuesto
            factura.setImpuesto(impuesto);
    
            facturaRepository.save(factura);
            System.out.println("Factura creada con ID: " + factura.getId() + " para la comanda ID: " + comanda.getId());
        }
        
        // --- NUEVA LÓGICA PARA ESTADO LISTA ---
        if (nuevoEstado == EstadoComanda.LISTA) {
            // Cuando la comanda está lista, la mesa debe cambiar a LISTA_PARA_PAGAR
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LISTA_PARA_PAGAR);
            mesaRepository.save(mesa);
            System.out.println("Mesa " + mesa.getNumero() + " actualizada a LISTA_PARA_PAGAR");
        }
        
        // --- LÓGICA PARA ESTADO ENTREGADA ---
        if (nuevoEstado == EstadoComanda.ENTREGADA) {
            // Cuando la comanda está entregada, la mesa debe cambiar a LISTA_PARA_PAGAR
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LISTA_PARA_PAGAR);
            mesaRepository.save(mesa);
            System.out.println("Mesa " + mesa.getNumero() + " actualizada a LISTA_PARA_PAGAR");
        }
        // --- FIN DE LA LÓGICA RESTAURADA ---
    
        comanda.setEstado(nuevoEstado);
        Comanda comandaActualizada = comandaRepository.save(comanda);
        ComandaResponseDTO dto = mapToComandaResponseDTO(comandaActualizada);
    
        // Notificaciones WebSocket (sin cambios)
        System.out.println("Enviando notificación a /topic/general sobre comanda ID: " + dto.getId());
        messagingTemplate.convertAndSend("/topic/general", dto);
        if (nuevoEstado == EstadoComanda.LISTA || nuevoEstado == EstadoComanda.ENTREGADA) {
            messagingTemplate.convertAndSend("/topic/caja", dto);
        }
        // Notificación para actualizar el estado de la mesa en todos los casos relevantes
        if (nuevoEstado == EstadoComanda.PAGADA || nuevoEstado == EstadoComanda.CANCELADA || 
            nuevoEstado == EstadoComanda.LISTA || nuevoEstado == EstadoComanda.ENTREGADA) {
            String mensaje = "Mesa " + comanda.getMesa().getNumero() + " actualizada a " + comanda.getMesa().getEstado();
            System.out.println("Enviando notificación a /topic/mesas: " + mensaje);
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

            // Validar stock de ingredientes
            inventarioService.validarStockIngredientes(producto, itemDTO.getCantidad());

            // Descontar stock de ingredientes
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
        
        // 5. ENVIAMOS NOTIFICACIÓN DE QUE LA COMANDA FUE MODIFICADA
        System.out.println("Enviando notificación a /topic/cocina sobre modificación de comanda ID: " + dto.getId());
        messagingTemplate.convertAndSend("/topic/cocina", dto);
        
        return dto;
    }

    // --- El resto de los métodos (getters, mapper, etc.) no cambian ---
    
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

    private ComandaResponseDTO mapToComandaResponseDTO(Comanda comanda) {
        ComandaResponseDTO dto = new ComandaResponseDTO();
        dto.setId(comanda.getId());
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
}