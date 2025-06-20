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
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

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

    public ComandaService(ComandaRepository comandaRepository, MesaRepository mesaRepository, ProductoRepository productoRepository) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
        this.productoRepository = productoRepository;
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
            // No es necesario llamar a save aquí, @Transactional se encargará
        }
        comanda.setTotal(totalComanda);
        mesa.setEstado(EstadoMesa.OCUPADA);

        Comanda comandaGuardada = comandaRepository.save(comanda);
        return mapToComandaResponseDTO(comandaGuardada);
    }
    public List<ComandaResponseDTO> getComandasByEstado(EstadoComanda estado) {
        return comandaRepository.findByEstado(estado).stream()
                .map(this::mapToComandaResponseDTO)
                .collect(Collectors.toList());
    }
    public List<ComandaResponseDTO> getAllComandas() {
        return comandaRepository.findAll().stream()
                .map(this::mapToComandaResponseDTO)
                .collect(Collectors.toList());
    }
    public List<ComandaResponseDTO> getComandasByEstados(List<EstadoComanda> estados) {
        return comandaRepository.findByEstadoIn(estados).stream()
                .map(this::mapToComandaResponseDTO)
                .collect(Collectors.toList());
    }
    public ComandaResponseDTO getComandaById(Long id) {
        Comanda comanda = comandaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + id));
        return mapToComandaResponseDTO(comanda);
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
        comanda.setEstado(nuevoEstado);

        // Lógica de negocio extra: si la comanda se paga, la mesa se libera.
        if (nuevoEstado == EstadoComanda.PAGADA) {
            Mesa mesa = comanda.getMesa();
            mesa.setEstado(EstadoMesa.LIBRE);
            mesaRepository.save(mesa);
        }

        Comanda comandaActualizada = comandaRepository.save(comanda);
        return mapToComandaResponseDTO(comandaActualizada);
    }

    // Helper para convertir Entity a DTO
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
    @Transactional
public ComandaResponseDTO agregarItemsAComanda(Long comandaId, List<ItemRequestDTO> itemsRequest) {
    // 1. Buscamos la comanda existente
    Comanda comanda = comandaRepository.findById(comandaId)
            .orElseThrow(() -> new ResourceNotFoundException("Comanda no encontrada con id: " + comandaId));

    // 2. Verificamos que la comanda esté en un estado modificable
    if (comanda.getEstado() != EstadoComanda.EN_PROCESO) {
        throw new IllegalStateException("Solo se pueden añadir items a una comanda que está EN PROCESO.");
    }

    // 3. Recorremos los nuevos items para añadirlos
    for (ItemRequestDTO itemDTO : itemsRequest) {
        Producto producto = productoRepository.findById(itemDTO.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + itemDTO.getProductoId()));

        if (producto.getStock() < itemDTO.getCantidad()) {
            throw new IllegalStateException("Stock insuficiente para el producto: " + producto.getNombre());
        }

        // Creamos y configuramos el nuevo item
        ComandaItem comandaItem = new ComandaItem();
        comandaItem.setProducto(producto);
        comandaItem.setCantidad(itemDTO.getCantidad());
        comandaItem.setPrecioUnitario(producto.getPrecio());
        comandaItem.setComanda(comanda);
        comanda.getItems().add(comandaItem);

        // Actualizamos el total de la comanda y el stock del producto
        comanda.setTotal(comanda.getTotal().add(producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad()))));
        producto.setStock(producto.getStock() - itemDTO.getCantidad());
    }

    // 4. Guardamos la comanda actualizada (los items y el producto se guardan en cascada gracias a @Transactional)
    Comanda comandaActualizada = comandaRepository.save(comanda);
    return mapToComandaResponseDTO(comandaActualizada);
}
public Optional<ComandaResponseDTO> getComandaActivaPorMesa(Long mesaId) {
    return comandaRepository
            .findFirstByMesaIdAndEstadoOrderByFechaHoraCreacionDesc(mesaId, EstadoComanda.EN_PROCESO)
            .map(this::mapToComandaResponseDTO);
}
}