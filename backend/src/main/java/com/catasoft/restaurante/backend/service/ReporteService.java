package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.ProductoVendidoDTO;
import com.catasoft.restaurante.backend.dto.ReporteVentasDTO;
import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.model.ComandaItem;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.repository.ComandaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    private final ComandaRepository comandaRepository;

    public ReporteService(ComandaRepository comandaRepository) {
        this.comandaRepository = comandaRepository;
    }

    public ReporteVentasDTO generarReporteVentas(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicioDelDia = fechaInicio.atStartOfDay();
        LocalDateTime finDelDia = fechaFin.atTime(LocalTime.MAX);

        List<Comanda> comandasPagadas = comandaRepository.findByEstadoAndFechaHoraCreacionBetween(
                EstadoComanda.PAGADA, inicioDelDia, finDelDia);

        BigDecimal totalRecaudado = comandasPagadas.stream()
                .map(Comanda::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, ProductoVendidoDTO> productosVendidosMap = comandasPagadas.stream()
                .flatMap(comanda -> comanda.getItems().stream())
                .collect(Collectors.groupingBy(item -> item.getProducto().getId(),
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            ProductoVendidoDTO dto = new ProductoVendidoDTO();
                            dto.setProductoId(list.get(0).getProducto().getId());
                            dto.setNombreProducto(list.get(0).getProducto().getNombre());
                            dto.setCantidadTotal(list.stream().mapToInt(ComandaItem::getCantidad).sum());
                            return dto;
                        })));

        List<ProductoVendidoDTO> topProductos = productosVendidosMap.values().stream()
                .sorted((a, b) -> Integer.compare(b.getCantidadTotal(), a.getCantidadTotal()))
                .collect(Collectors.toList());

        ReporteVentasDTO reporte = new ReporteVentasDTO();
        reporte.setFechaInicio(fechaInicio);
        reporte.setFechaFin(fechaFin);
        reporte.setNumeroDeVentas(comandasPagadas.size());
        reporte.setTotalRecaudado(totalRecaudado);
        reporte.setProductosMasVendidos(topProductos);

        return reporte;
    }
}