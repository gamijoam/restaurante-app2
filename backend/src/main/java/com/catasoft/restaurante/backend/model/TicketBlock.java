package com.catasoft.restaurante.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "ticket_blocks")
public class TicketBlock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "block_id", nullable = false)
    private String blockId;
    
    @Column(name = "type", nullable = false)
    private String type;
    
    @Column(name = "value")
    private String value;
    
    @Column(name = "align")
    private String align;
    
    @Column(name = "bold")
    private Boolean bold = false;
    
    @Column(name = "label")
    private String label;
    
    @Column(name = "field")
    private String field;
    
    @Column(name = "format")
    private String format;
    
    @Column(name = "position")
    private Integer position;
    
    // Relación con la plantilla
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_template_id")
    private TicketTemplate ticketTemplate;
    
    // Para bloques de tipo tabla, almacenar columnas como JSON
    @Column(name = "columns_json")
    private String columnsJson;
    
    // Constructors
    public TicketBlock() {}
    
    public TicketBlock(String blockId, String type, String value, String align, Boolean bold) {
        this.blockId = blockId;
        this.type = type;
        this.value = value;
        this.align = align;
        this.bold = bold;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getBlockId() {
        return blockId;
    }
    
    public void setBlockId(String blockId) {
        this.blockId = blockId;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getValue() {
        return value;
    }
    
    public void setValue(String value) {
        this.value = value;
    }
    
    public String getAlign() {
        return align;
    }
    
    public void setAlign(String align) {
        this.align = align;
    }
    
    public Boolean getBold() {
        return bold;
    }
    
    public void setBold(Boolean bold) {
        this.bold = bold;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }
    
    public String getField() {
        return field;
    }
    
    public void setField(String field) {
        this.field = field;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public Integer getPosition() {
        return position;
    }
    
    public void setPosition(Integer position) {
        this.position = position;
    }
    
    public TicketTemplate getTicketTemplate() {
        return ticketTemplate;
    }
    
    public void setTicketTemplate(TicketTemplate ticketTemplate) {
        this.ticketTemplate = ticketTemplate;
    }
    
    public String getColumnsJson() {
        return columnsJson;
    }
    
    public void setColumnsJson(String columnsJson) {
        this.columnsJson = columnsJson;
    }
} 