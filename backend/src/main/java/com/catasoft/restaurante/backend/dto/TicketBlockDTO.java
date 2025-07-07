package com.catasoft.restaurante.backend.dto;

import java.util.List;

public class TicketBlockDTO {
    
    private String id;
    private String type;
    private String value;
    private String align;
    private Boolean bold;
    private String label;
    private String field;
    private String format;
    private List<String> columns;
    
    // Constructors
    public TicketBlockDTO() {}
    
    public TicketBlockDTO(String id, String type, String value, String align, Boolean bold) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.align = align;
        this.bold = bold;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
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
    
    public List<String> getColumns() {
        return columns;
    }
    
    public void setColumns(List<String> columns) {
        this.columns = columns;
    }
} 