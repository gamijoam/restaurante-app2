package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.ComandaItemResponseDTO;
import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.dto.ItemRequestDTO;
import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.*;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- IMPORTACIÓN CORREGIDA
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
public class ComandaService {

    private final ComandaRepository comandaRepository;
    private final MesaRepository mesaRepository;
    private final ProductoRepository productoRepository;
    private final SimpMessagingTemplate messagingTemplate; // <-- 1. AÑADIMOS EL TEMPLATE DE MENSAJERÍA

    // 2. ACTUALIZAMOS EL CONSTRUCTOR PARA INYECTAR EL TEMPLATE
    public ComandaService(ComandaRepository comandaRepository, MesaRepository mesaRepository, ProductoRepository productoRepository, SimpMessagingTemplate messagingTemplate) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
        this.productoRepository = productoRepository;
        this.messagingTemplate = messagingTemplate;
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
            if (producto.getStock() < itemDTO.getCantidad()) {
                throw new IllegalStateException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            ComandaItem comandaItem = new ComandaItem();
            comandaItem.setProducto(producto);
            comandaItem.setCantidad(itemDTO.getCantidad());
            comandaItem.setPrecioUnitario(producto.getPrecio());
            comandaItem.setComanda(comanda);
            comanda.getItems().add(comandaItem);

            totalComanda = totalComanda.add(producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad())));
            producto.setStock(producto.getStock() - itemDTO.getCantidad());
        }
        comanda.setTotal(totalComanda);
        mesa.setEstado(EstadoMesa.OCUPADA);

        Comanda comandaGuardada = comandaRepository.save(comanda);
        ComandaResponseDTO dto = mapToComandaResponseDTO(comandaGuardada);

        // 3. ENVIAMOS LA NOTIFICACIÓN WEBSOCKET AL CANAL DE LA COCINA
        System.out.println("Enviando notificación a /topic/cocina para nueva comanda ID: " + dto.getId());
        messagingTemplate.convertAndSend("/topic/cocina", dto);

        return dto;
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
            if (comanda.getEstado() != EstadoComanda.EN_PROCESO) {
                throw new IllegalStateException("Solo se pueden cancelar comandas que están EN PROCESO.");
            }
            for (ComandaItem item : comanda.getItems()) {
                Producto producto = item.getProducto();
                producto.setStock(producto.getStock() + item.getCantidad());
            }
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
        }
        
        if (nuevoEstado == EstadoComanda.PAGADA) {
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
        }

        comanda.setEstado(nuevoEstado);
        Comanda comandaActualizada = comandaRepository.save(comanda);
        ComandaResponseDTO dto = mapToComandaResponseDTO(comandaActualizada);

        // 4. ENVIAMOS NOTIFICACIONES WEBSOCKET A LOS CANALES RELEVANTES
        System.out.println("Enviando notificación a /topic/general sobre comanda ID: " + dto.getId());
        messagingTemplate.convertAndSend("/topic/general", dto);

        if (nuevoEstado == EstadoComanda.LISTA || nuevoEstado == EstadoComanda.ENTREGADA) {
            messagingTemplate.convertAndSend("/topic/caja", dto);
        }
        if (nuevoEstado == EstadoComanda.PAGADA || nuevoEstado == EstadoComanda.CANCELADA) {
            messagingTemplate.convertAndSend("/topic/mesas", "Mesa " + comanda.getMesa().getNumero() + " actualizada");
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

            if (producto.getStock() < itemDTO.getCantidad()) {
                throw new IllegalStateException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            ComandaItem comandaItem = new ComandaItem();
            comandaItem.setProducto(producto);
            comandaItem.setCantidad(itemDTO.getCantidad());
            comandaItem.setPrecioUnitario(producto.getPrecio());
            comandaItem.setComanda(comanda);
            comanda.getItems().add(comandaItem);

            comanda.setTotal(comanda.getTotal().add(producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad()))));
            producto.setStock(producto.getStock() - itemDTO.getCantidad());
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