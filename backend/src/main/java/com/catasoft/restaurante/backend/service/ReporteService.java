package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.ProductoVendidoDTO;
import com.catasoft.restaurante.backend.dto.ReporteVentasDTO;
import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.model.ComandaItem;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.repository.ComandaRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
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
                            java.math.BigDecimal precioUnitario = list.get(0).getProducto().getPrecio();
                            dto.setPrecioUnitario(precioUnitario);
                            dto.setTotalGenerado(precioUnitario.multiply(new java.math.BigDecimal(dto.getCantidadTotal())));
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

    public ByteArrayInputStream exportarReporteVentasExcel(ReporteVentasDTO reporte) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Reporte de Ventas");
            int rowIdx = 0;
            Row header = sheet.createRow(rowIdx++);
            header.createCell(0).setCellValue("Producto");
            header.createCell(1).setCellValue("Cantidad Vendida");
            header.createCell(2).setCellValue("Precio Unitario");
            header.createCell(3).setCellValue("Total Generado");
            for (var prod : reporte.getProductosMasVendidos()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(prod.getNombreProducto());
                row.createCell(1).setCellValue(prod.getCantidadTotal());
                row.createCell(2).setCellValue(prod.getPrecioUnitario() != null ? prod.getPrecioUnitario().doubleValue() : 0);
                row.createCell(3).setCellValue(prod.getTotalGenerado() != null ? prod.getTotalGenerado().doubleValue() : 0);
            }
            Row totalRow = sheet.createRow(rowIdx++);
            totalRow.createCell(0).setCellValue("Total Recaudado");
            totalRow.createCell(1).setCellValue("");
            totalRow.createCell(2).setCellValue("");
            totalRow.createCell(3).setCellValue(reporte.getTotalRecaudado() != null ? reporte.getTotalRecaudado().doubleValue() : 0);
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}