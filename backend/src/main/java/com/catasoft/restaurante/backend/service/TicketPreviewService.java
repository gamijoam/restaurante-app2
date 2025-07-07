package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.TicketBlockDTO;
import com.catasoft.restaurante.backend.dto.TicketTemplateDTO;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TicketPreviewService {
    
    // Datos de ejemplo para la previsualización
    private static final TicketData SAMPLE_DATA = new TicketData(
        "Mesa 5",
        "COM-001",
        LocalDateTime.now(),
        List.of(
            new TicketItem("Hamburguesa Clásica", 2, 12.50, 25.00),
            new TicketItem("Papas Fritas", 1, 5.00, 5.00),
            new TicketItem("Coca Cola", 2, 3.50, 7.00)
        ),
        37.00
    );
    
    public byte[] generatePreviewPdf(TicketTemplateDTO template) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // Configurar el documento para simular un ticket térmico
            document.setMargins(10, 10, 10, 10);
            
            // Procesar cada bloque de la plantilla
            if (template.getBlocks() != null) {
                for (TicketBlockDTO block : template.getBlocks()) {
                    processBlock(document, block, SAMPLE_DATA);
                }
            }
            
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generando previsualización PDF", e);
        }
    }
    
    private void processBlock(Document document, TicketBlockDTO block, TicketData data) {
        switch (block.getType()) {
            case "text":
                processTextBlock(document, block);
                break;
            case "line":
                processLineBlock(document);
                break;
            case "datetime":
                processDateTimeBlock(document, block);
                break;
            case "table":
                processTableBlock(document, block, data);
                break;
            case "total":
                processTotalBlock(document, block, data);
                break;
            case "qr":
                processQrBlock(document, block);
                break;
            case "logo":
                processLogoBlock(document);
                break;
            default:
                // Bloque no reconocido, ignorar
                break;
        }
    }
    
    private void processTextBlock(Document document, TicketBlockDTO block) {
        String text = block.getValue() != null ? block.getValue() : "";
        
        // Aplicar alineación usando espacios
        if ("center".equals(block.getAlign())) {
            text = "                    " + text; // Centrado aproximado
        } else if ("right".equals(block.getAlign())) {
            text = "                                        " + text; // Derecha aproximada
        }
        
        Paragraph paragraph = new Paragraph(text);
        
        // Aplicar negrita
        if (Boolean.TRUE.equals(block.getBold())) {
            paragraph.setBold();
        }
        
        document.add(paragraph);
    }
    
    private void processLineBlock(Document document) {
        Paragraph line = new Paragraph("--------------------------------");
        document.add(line);
    }
    
    private void processDateTimeBlock(Document document, TicketBlockDTO block) {
        String format = block.getFormat() != null ? block.getFormat() : "dd/MM/yyyy HH:mm";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
        String dateStr = LocalDateTime.now().format(formatter);
        
        Paragraph paragraph = new Paragraph(dateStr);
        document.add(paragraph);
    }
    
    private void processTableBlock(Document document, TicketBlockDTO block, TicketData data) {
        if (block.getColumns() != null && !block.getColumns().isEmpty()) {
            // Crear encabezados
            StringBuilder header = new StringBuilder();
            for (String column : block.getColumns()) {
                header.append(column).append(" | ");
            }
            document.add(new Paragraph(header.toString()));
            document.add(new Paragraph("--------------------------------"));
            
            // Agregar datos de ejemplo
            for (TicketItem item : data.getItems()) {
                String row = String.format("%s | %d | $%.2f | $%.2f", 
                    item.getNombre(), item.getCantidad(), item.getPrecioUnitario(), item.getPrecioTotal());
                document.add(new Paragraph(row));
            }
        }
    }
    
    private void processTotalBlock(Document document, TicketBlockDTO block, TicketData data) {
        String label = block.getLabel() != null ? block.getLabel() : "Total";
        String total = String.format("                                        %s: $%.2f", label, data.getTotal());
        Paragraph totalParagraph = new Paragraph(total);
        totalParagraph.setBold();
        document.add(totalParagraph);
    }
    
    private void processQrBlock(Document document, TicketBlockDTO block) {
        if (block.getValue() != null) {
            Paragraph qrPlaceholder = new Paragraph("[QR Code: " + block.getValue() + "]");
            document.add(qrPlaceholder);
        }
    }
    
    private void processLogoBlock(Document document) {
        Paragraph logoPlaceholder = new Paragraph("[LOGO]");
        document.add(logoPlaceholder);
    }
    
    // Clases de datos de ejemplo
    public static class TicketData {
        private String nombreMesa;
        private String comandaId;
        private LocalDateTime fechaHora;
        private List<TicketItem> items;
        private double total;
        
        public TicketData(String nombreMesa, String comandaId, LocalDateTime fechaHora, List<TicketItem> items, double total) {
            this.nombreMesa = nombreMesa;
            this.comandaId = comandaId;
            this.fechaHora = fechaHora;
            this.items = items;
            this.total = total;
        }
        
        // Getters
        public String getNombreMesa() { return nombreMesa; }
        public String getComandaId() { return comandaId; }
        public LocalDateTime getFechaHora() { return fechaHora; }
        public List<TicketItem> getItems() { return items; }
        public double getTotal() { return total; }
    }
    
    public static class TicketItem {
        private String nombre;
        private int cantidad;
        private double precioUnitario;
        private double precioTotal;
        
        public TicketItem(String nombre, int cantidad, double precioUnitario, double precioTotal) {
            this.nombre = nombre;
            this.cantidad = cantidad;
            this.precioUnitario = precioUnitario;
            this.precioTotal = precioTotal;
        }
        
        // Getters
        public String getNombre() { return nombre; }
        public int getCantidad() { return cantidad; }
        public double getPrecioUnitario() { return precioUnitario; }
        public double getPrecioTotal() { return precioTotal; }
    }
} 