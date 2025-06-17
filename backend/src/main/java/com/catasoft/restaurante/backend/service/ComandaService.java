package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
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

    @Transactional // Anotación clave: si algo falla, toda la operación se revierte (rollback).
    public Comanda crearComanda(ComandaRequestDTO request) {
        // 1. Validar y obtener la mesa
        Mesa mesa = mesaRepository.findById(request.getMesaId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con id: " + request.getMesaId()));

        if (mesa.getEstado() != EstadoMesa.LIBRE) {
            throw new IllegalStateException("La mesa " + mesa.getNumero() + " no está libre.");
        }

        // 2. Crear la comanda
        Comanda comanda = new Comanda();
        comanda.setMesa(mesa);
        comanda.setFechaHoraCreacion(LocalDateTime.now());
        comanda.setEstado(EstadoComanda.EN_PROCESO);

        BigDecimal totalComanda = BigDecimal.ZERO;

        // 3. Procesar cada item de la comanda
        for (ItemRequestDTO itemDTO : request.getItems()) {
            Producto producto = productoRepository.findById(itemDTO.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + itemDTO.getProductoId()));

            if (producto.getStock() < itemDTO.getCantidad()) {
                throw new IllegalStateException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Crear el ComandaItem y asociarlo
            ComandaItem comandaItem = new ComandaItem();
            comandaItem.setProducto(producto);
            comandaItem.setCantidad(itemDTO.getCantidad());
            comandaItem.setPrecioUnitario(producto.getPrecio());
            comandaItem.setComanda(comanda); // Enlazar al padre
            comanda.getItems().add(comandaItem); // Añadir a la lista del padre

            // Actualizar el total y el stock
            totalComanda = totalComanda.add(producto.getPrecio().multiply(BigDecimal.valueOf(itemDTO.getCantidad())));
            producto.setStock(producto.getStock() - itemDTO.getCantidad());
            productoRepository.save(producto); // Guardar el stock actualizado
        }

        // 4. Finalizar y guardar
        comanda.setTotal(totalComanda);
        mesa.setEstado(EstadoMesa.OCUPADA);
        mesaRepository.save(mesa);

        return comandaRepository.save(comanda);
    }
}