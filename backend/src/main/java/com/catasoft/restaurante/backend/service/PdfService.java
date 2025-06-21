package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.ComandaItem;
import com.catasoft.restaurante.backend.model.Factura;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public ByteArrayInputStream generarPdfFactura(Factura factura) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(out);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            // --- Encabezado de la Factura ---
            document.add(new Paragraph("Restaurante 'El Buen Sabor'").setTextAlignment(TextAlignment.CENTER).setBold().setFontSize(20));
            document.add(new Paragraph("Factura de Venta").setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph("Factura #: " + factura.getId()));
            document.add(new Paragraph("Mesa: " + factura.getComanda().getMesa().getNumero()));
            document.add(new Paragraph("Fecha: " + factura.getFechaEmision().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))));
            document.add(new Paragraph("--------------------------------------------------"));

            // --- Tabla con los Items de la Comanda ---
            Table table = new Table(UnitValue.createPercentArray(new float[]{4, 1, 2, 2}));
            table.setWidth(UnitValue.createPercentValue(100));
            table.addHeaderCell("Producto");
            table.addHeaderCell("Cant.");
            table.addHeaderCell("Precio Unit.");
            table.addHeaderCell("Subtotal");

            for (ComandaItem item : factura.getComanda().getItems()) {
                table.addCell(item.getProducto().getNombre());
                table.addCell(String.valueOf(item.getCantidad()));
                table.addCell("$" + String.format("%.2f", item.getPrecioUnitario()));
                BigDecimal subtotal = item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad()));
                table.addCell("$" + String.format("%.2f", subtotal));
            }
            document.add(table);

            // --- Totales ---
            document.add(new Paragraph("--------------------------------------------------").setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Impuesto: $" + String.format("%.2f", factura.getImpuesto())).setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Total a Pagar: $" + String.format("%.2f", factura.getTotal())).setTextAlignment(TextAlignment.RIGHT).setBold().setFontSize(14));

        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}