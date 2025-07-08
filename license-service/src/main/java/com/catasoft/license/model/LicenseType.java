package com.catasoft.license.model;

public enum LicenseType {
    HOURLY("Por Hora", 1), // 1 hora
    DAILY("Diaria", 24),   // 24 horas
    MONTHLY("Mensual", 30 * 24), // 30 días en horas
    ANNUAL("Anual", 365 * 24),   // 365 días en horas
    PERPETUAL("Perpetua", -1);
    
    private final String displayName;
    private final int hoursDuration;
    
    LicenseType(String displayName, int hoursDuration) {
        this.displayName = displayName;
        this.hoursDuration = hoursDuration;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getHoursDuration() {
        return hoursDuration;
    }
    
    public int getDaysDuration() {
        return hoursDuration / 24;
    }
    
    public boolean isPerpetual() {
        return this == PERPETUAL;
    }
} 