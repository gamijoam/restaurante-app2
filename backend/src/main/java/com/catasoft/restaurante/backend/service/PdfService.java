package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.ComandaItem;
import com.catasoft.restaurante.backend.model.Factura;
import com.catasoft.restaurante.backend.dto.ReporteVentasDTO;
import com.catasoft.restaurante.backend.dto.ProductoVendidoDTO;
import com.catasoft.restaurante.backend.dto.BusinessConfigDTO;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfService {

    @Autowired
    private BusinessConfigService businessConfigService;
    
    /**
     * Generar PDF de factura con configuración del negocio
     */
    public byte[] generarPdfFactura(Factura factura) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Obtener configuración del negocio
            BusinessConfigDTO businessConfig = businessConfigService.getActiveConfig();
            
            // Configurar fuentes
            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontNormal = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            
            // --- ENCABEZADO ---
            Paragraph header = new Paragraph("🍽️ " + businessConfig.getBusinessName())
                .setFont(fontBold)
                .setFontSize(24)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
            document.add(header);
            
            // --- INFORMACIÓN DEL NEGOCIO ---
            Table businessInfoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
            businessInfoTable.setWidth(UnitValue.createPercentValue(100));
            
            // Columna izquierda - Información del negocio
            Cell businessCell = new Cell();
            businessCell.add(new Paragraph("📋 Información del Negocio").setFont(fontBold).setFontSize(14));
            if (businessConfig.getTaxId() != null && !businessConfig.getTaxId().isEmpty()) {
                businessCell.add(new Paragraph("RIF: " + businessConfig.getTaxId()).setFont(fontNormal));
            }
            if (businessConfig.getAddress() != null && !businessConfig.getAddress().isEmpty()) {
                businessCell.add(new Paragraph("📍 " + businessConfig.getAddress()).setFont(fontNormal));
            }
            if (businessConfig.getPhone() != null && !businessConfig.getPhone().isEmpty()) {
                businessCell.add(new Paragraph("📞 " + businessConfig.getPhone()).setFont(fontNormal));
            }
            if (businessConfig.getEmail() != null && !businessConfig.getEmail().isEmpty()) {
                businessCell.add(new Paragraph("📧 " + businessConfig.getEmail()).setFont(fontNormal));
            }
            businessInfoTable.addCell(businessCell);
            
            // Columna derecha - Información de la factura
            Cell invoiceCell = new Cell();
            invoiceCell.add(new Paragraph("🧾 Información de la Factura").setFont(fontBold).setFontSize(14));
            invoiceCell.add(new Paragraph("Factura #: " + factura.getId()).setFont(fontNormal));
            invoiceCell.add(new Paragraph("Mesa #: " + factura.getComanda().getMesa().getNumero()).setFont(fontNormal));
            invoiceCell.add(new Paragraph("Fecha: " + factura.getFechaEmision().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).setFont(fontNormal));
            invoiceCell.add(new Paragraph("Estado: " + factura.getEstado()).setFont(fontNormal));
            businessInfoTable.addCell(invoiceCell);
            
            document.add(businessInfoTable);
            document.add(new Paragraph("").setMarginBottom(20));

            // --- PRODUCTOS ---
            Paragraph productsHeader = new Paragraph("🛒 Productos Consumidos")
                .setFont(fontBold)
                .setFontSize(16)
                .setMarginBottom(10);
            document.add(productsHeader);
            
            Table productTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1, 1}));
            productTable.setWidth(UnitValue.createPercentValue(100));
            
            // Encabezados de la tabla
            Color headerBgColor = new DeviceRgb(52, 73, 94);
            Cell headerCell1 = new Cell().add(new Paragraph("Producto").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255)));
            headerCell1.setBackgroundColor(headerBgColor);
            productTable.addHeaderCell(headerCell1);
            
            Cell headerCell2 = new Cell().add(new Paragraph("Cant.").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255)));
            headerCell2.setBackgroundColor(headerBgColor);
            productTable.addHeaderCell(headerCell2);
            
            Cell headerCell3 = new Cell().add(new Paragraph("Precio Unit.").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255)));
            headerCell3.setBackgroundColor(headerBgColor);
            productTable.addHeaderCell(headerCell3);
            
            Cell headerCell4 = new Cell().add(new Paragraph("Total").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255)));
            headerCell4.setBackgroundColor(headerBgColor);
            productTable.addHeaderCell(headerCell4);
            
            // Agregar productos
            for (ComandaItem item : factura.getComanda().getItems()) {
                productTable.addCell(new Cell().add(new Paragraph(item.getProducto().getNombre()).setFont(fontNormal)));
                productTable.addCell(new Cell().add(new Paragraph(String.valueOf(item.getCantidad())).setFont(fontNormal)));
                productTable.addCell(new Cell().add(new Paragraph("$" + item.getPrecioUnitario()).setFont(fontNormal)));
                productTable.addCell(new Cell().add(new Paragraph("$" + item.getSubtotal()).setFont(fontNormal)));
            }
            
            document.add(productTable);
            document.add(new Paragraph("").setMarginBottom(20));
            
            // --- TOTALES ---
            Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}));
            totalsTable.setWidth(UnitValue.createPercentValue(60));
            totalsTable.setHorizontalAlignment(HorizontalAlignment.RIGHT);
            
            // Subtotal
            totalsTable.addCell(new Cell().add(new Paragraph("Subtotal:").setFont(fontBold)));
            totalsTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", factura.getSubtotal())).setFont(fontNormal)));
            
            // Impuesto
            BigDecimal taxPercentage = factura.getImpuesto().divide(factura.getSubtotal(), 3, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100));
            totalsTable.addCell(new Cell().add(new Paragraph("Impuesto (" + String.format("%.1f", taxPercentage) + "%):").setFont(fontBold)));
            totalsTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", factura.getImpuesto())).setFont(fontNormal)));
            
            // Total
            Color totalBgColor = new DeviceRgb(46, 204, 113);
            Cell totalLabelCell = new Cell().add(new Paragraph("TOTAL:").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255)));
            totalLabelCell.setBackgroundColor(totalBgColor);
            totalsTable.addCell(totalLabelCell);
            
            Cell totalValueCell = new Cell().add(new Paragraph("$" + String.format("%.2f", factura.getTotal())).setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255)));
            totalValueCell.setBackgroundColor(totalBgColor);
            totalsTable.addCell(totalValueCell);
            
            document.add(totalsTable);
            document.add(new Paragraph("").setMarginBottom(20));
            
            // --- PIE DE PÁGINA ---
            if (businessConfig.getDescription() != null && !businessConfig.getDescription().isEmpty()) {
                Paragraph footer = new Paragraph("💡 " + businessConfig.getDescription())
                    .setFont(fontNormal)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20);
                document.add(footer);
            }
            
            if (businessConfig.getWebsite() != null && !businessConfig.getWebsite().isEmpty()) {
                Paragraph website = new Paragraph("🌐 " + businessConfig.getWebsite())
                    .setFont(fontNormal)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER);
                document.add(website);
            }
            
            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF de factura", e);
        }
    }
    
    /**
     * Generar PDF de reporte de ventas
     */
    public byte[] generarPdfReporteVentas(ReporteVentasDTO reporte) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Obtener configuración del negocio
            BusinessConfigDTO businessConfig = businessConfigService.getActiveConfig();
            
            // Configurar fuentes
            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontNormal = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            
            // --- ENCABEZADO ---
            Paragraph header = new Paragraph("📊 Reporte de Ventas - " + businessConfig.getBusinessName())
                .setFont(fontBold)
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
            document.add(header);
            
            // --- RESUMEN ---
            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
            summaryTable.setWidth(UnitValue.createPercentValue(100));
            
            summaryTable.addCell(new Cell().add(new Paragraph("Total de Ventas:").setFont(fontBold)));
            summaryTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", reporte.getTotalRecaudado())).setFont(fontNormal)));
            
            summaryTable.addCell(new Cell().add(new Paragraph("Total de Facturas:").setFont(fontBold)));
            summaryTable.addCell(new Cell().add(new Paragraph(String.valueOf(reporte.getNumeroDeVentas())).setFont(fontNormal)));
            
            // Calcular promedio
            BigDecimal promedio = reporte.getNumeroDeVentas() > 0 ? 
                reporte.getTotalRecaudado().divide(BigDecimal.valueOf(reporte.getNumeroDeVentas()), 2, BigDecimal.ROUND_HALF_UP) : 
                BigDecimal.ZERO;
            summaryTable.addCell(new Cell().add(new Paragraph("Promedio por Factura:").setFont(fontBold)));
            summaryTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", promedio)).setFont(fontNormal)));
            
            document.add(summaryTable);
            document.add(new Paragraph("").setMarginBottom(20));
            
            // --- PRODUCTOS MÁS VENDIDOS ---
            Paragraph productsHeader = new Paragraph("🏆 Productos Más Vendidos")
                .setFont(fontBold)
                .setFontSize(16)
                .setMarginBottom(10);
            document.add(productsHeader);
            
            Table productTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1}));
            productTable.setWidth(UnitValue.createPercentValue(100));
            
            // Encabezados
            Color headerBgColor = new DeviceRgb(52, 73, 94);
            productTable.addHeaderCell(new Cell().add(new Paragraph("Producto").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255))).setBackgroundColor(headerBgColor));
            productTable.addHeaderCell(new Cell().add(new Paragraph("Cantidad").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255))).setBackgroundColor(headerBgColor));
            productTable.addHeaderCell(new Cell().add(new Paragraph("Total").setFont(fontBold).setFontColor(new DeviceRgb(255, 255, 255))).setBackgroundColor(headerBgColor));
            
            // Productos
            for (ProductoVendidoDTO producto : reporte.getProductosMasVendidos()) {
                productTable.addCell(new Cell().add(new Paragraph(producto.getNombreProducto()).setFont(fontNormal)));
                productTable.addCell(new Cell().add(new Paragraph(String.valueOf(producto.getCantidadTotal())).setFont(fontNormal)));
                productTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", producto.getTotalGenerado())).setFont(fontNormal)));
            }
            
            document.add(productTable);
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF de reporte", e);
        }
    }
}