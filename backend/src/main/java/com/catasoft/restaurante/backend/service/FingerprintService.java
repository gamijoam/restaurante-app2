package com.catasoft.restaurante.backend.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.security.MessageDigest;
import java.util.Enumeration;

@Service
public class FingerprintService {
    
    private static final String SALT = "CatasoftRestaurantApp2024";
    
    /**
     * Genera un fingerprint único para el equipo
     */
    public String generateFingerprint() {
        try {
            StringBuilder sb = new StringBuilder();
            
            // Información del sistema operativo
            sb.append("OS:").append(System.getProperty("os.name")).append(";");
            sb.append("OS_VERSION:").append(System.getProperty("os.version")).append(";");
            sb.append("OS_ARCH:").append(System.getProperty("os.arch")).append(";");
            
            // Información de Java
            sb.append("JAVA_VERSION:").append(System.getProperty("java.version")).append(";");
            sb.append("JAVA_VENDOR:").append(System.getProperty("java.vendor")).append(";");
            
            // Información del usuario
            sb.append("USER_NAME:").append(System.getProperty("user.name")).append(";");
            sb.append("USER_HOME:").append(System.getProperty("user.home")).append(";");
            
            // MAC addresses
            sb.append("MAC_ADDRESSES:");
            try {
                Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
                while (networkInterfaces.hasMoreElements()) {
                    NetworkInterface networkInterface = networkInterfaces.nextElement();
                    if (networkInterface.getHardwareAddress() != null) {
                        byte[] mac = networkInterface.getHardwareAddress();
                        StringBuilder macSb = new StringBuilder();
                        for (int i = 0; i < mac.length; i++) {
                            macSb.append(String.format("%02X%s", mac[i], (i < mac.length - 1) ? "-" : ""));
                        }
                        sb.append(macSb.toString()).append(",");
                    }
                }
            } catch (SocketException e) {
                sb.append("UNKNOWN");
            }
            sb.append(";");
            
            // Información del procesador
            sb.append("PROCESSORS:").append(Runtime.getRuntime().availableProcessors()).append(";");
            
            // Memoria total
            sb.append("TOTAL_MEMORY:").append(Runtime.getRuntime().totalMemory()).append(";");
            
            // Información adicional del sistema
            sb.append("FILE_SEPARATOR:").append(System.getProperty("file.separator")).append(";");
            sb.append("PATH_SEPARATOR:").append(System.getProperty("path.separator")).append(";");
            sb.append("LINE_SEPARATOR:").append(System.getProperty("line.separator").hashCode()).append(";");
            
            // Generar hash del fingerprint
            String fingerprint = sb.toString();
            String saltedFingerprint = fingerprint + SALT;
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(saltedFingerprint.getBytes("UTF-8"));
            
            // Convertir a formato legible
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < 16; i += 4) {
                if (i > 0) result.append("-");
                result.append(String.format("%04X", 
                    ((hash[i] & 0xFF) << 24) | 
                    ((hash[i+1] & 0xFF) << 16) | 
                    ((hash[i+2] & 0xFF) << 8) | 
                    (hash[i+3] & 0xFF)));
            }
            
            return "FP-" + result.toString();
            
        } catch (Exception e) {
            // Fallback simple
            return "FP-FALLBACK-" + System.currentTimeMillis();
        }
    }
    
    /**
     * Obtiene información detallada del sistema para debugging
     */
    public String getSystemInfo() {
        StringBuilder sb = new StringBuilder();
        sb.append("=== SYSTEM INFORMATION ===\n");
        sb.append("OS: ").append(System.getProperty("os.name")).append(" ").append(System.getProperty("os.version")).append("\n");
        sb.append("Architecture: ").append(System.getProperty("os.arch")).append("\n");
        sb.append("Java Version: ").append(System.getProperty("java.version")).append("\n");
        sb.append("Java Vendor: ").append(System.getProperty("java.vendor")).append("\n");
        sb.append("User: ").append(System.getProperty("user.name")).append("\n");
        sb.append("Processors: ").append(Runtime.getRuntime().availableProcessors()).append("\n");
        sb.append("Total Memory: ").append(Runtime.getRuntime().totalMemory() / 1024 / 1024).append(" MB\n");
        sb.append("Free Memory: ").append(Runtime.getRuntime().freeMemory() / 1024 / 1024).append(" MB\n");
        
        // MAC addresses
        sb.append("MAC Addresses:\n");
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface networkInterface = networkInterfaces.nextElement();
                if (networkInterface.getHardwareAddress() != null) {
                    byte[] mac = networkInterface.getHardwareAddress();
                    StringBuilder macSb = new StringBuilder();
                    for (int i = 0; i < mac.length; i++) {
                        macSb.append(String.format("%02X%s", mac[i], (i < mac.length - 1) ? "-" : ""));
                    }
                    sb.append("  ").append(networkInterface.getDisplayName()).append(": ").append(macSb.toString()).append("\n");
                }
            }
        } catch (SocketException e) {
            sb.append("  Error getting MAC addresses: ").append(e.getMessage()).append("\n");
        }
        
        return sb.toString();
    }
} 