package com.catasoft.license.service;

import com.catasoft.license.dto.LicenseRequestDTO;
import com.catasoft.license.dto.LicenseResponseDTO;
import com.catasoft.license.dto.ValidateRequestDTO;
import com.catasoft.license.model.Activation;
import com.catasoft.license.model.License;
import com.catasoft.license.model.LicenseType;
import com.catasoft.license.repository.ActivationRepository;
import com.catasoft.license.repository.LicenseRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class LicenseService {
    
    @Value("${license.secret-key}")
    private String secretKey;
    
    @Value("${license.fingerprint-salt}")
    private String fingerprintSalt;
    
    private final LicenseRepository licenseRepository;
    private final ActivationRepository activationRepository;
    
    public LicenseService(LicenseRepository licenseRepository, ActivationRepository activationRepository) {
        this.licenseRepository = licenseRepository;
        this.activationRepository = activationRepository;
    }
    
    /**
     * Genera una nueva licencia
     */
    public LicenseResponseDTO generateLicense(LicenseRequestDTO request) {
        try {
            // Elimina la comprobación y desactivación de activaciones previas
            // Permite siempre crear una nueva licencia y activación
            // Crear la licencia
            License license = new License();
            license.setLicenseCode(generateLicenseCode());
            license.setType(request.getLicenseType());
            license.setClientName(request.getClientName());
            license.setClientContact(request.getClientContact());
            license.setNotes(request.getNotes());
            // Calcular fecha de expiración
            if (request.getLicenseType() == LicenseType.PERPETUAL) {
                license.setExpiresAt(LocalDateTime.now().plusYears(100)); // Prácticamente perpetua
            } else {
                int durationHours = request.getDuration() != null ? 
                    (request.getLicenseType() == LicenseType.HOURLY ? request.getDuration() : request.getDuration() * 24) :
                    request.getLicenseType().getHoursDuration();
                license.setExpiresAt(LocalDateTime.now().plusHours(durationHours));
            }
            // Guardar licencia
            license = licenseRepository.save(license);
            // Crear activación
            Activation activation = new Activation();
            activation.setLicense(license);
            activation.setFingerprint(request.getFingerprint());
            activation.setMachineInfo("Activado desde License Service");
            activationRepository.save(activation);
            // Crear respuesta
            return createLicenseResponse(license, "Licencia generada exitosamente");
        } catch (Exception e) {
            throw new RuntimeException("Error generando licencia: " + e.getMessage());
        }
    }
    
    /**
     * Valida una licencia
     */
    public LicenseResponseDTO validateLicense(ValidateRequestDTO request) {
        try {
            // Buscar licencia
            Optional<License> licenseOpt = licenseRepository.findByLicenseCode(request.getLicenseCode());
            if (licenseOpt.isEmpty()) {
                return createErrorResponse("Licencia no encontrada");
            }
            
            License license = licenseOpt.get();
            
            // Verificar si está activa
            if (!license.isActive()) {
                return createErrorResponse("Licencia inactiva");
            }
            
            // Verificar si ha expirado
            if (license.isExpired()) {
                return createErrorResponse("Licencia expirada");
            }
            
            // Verificar activación
            Optional<Activation> activationOpt = activationRepository.findByLicenseCodeAndFingerprint(
                request.getLicenseCode(), request.getFingerprint());
            
            if (activationOpt.isEmpty()) {
                return createErrorResponse("Licencia no activada en este equipo");
            }
            
            Activation activation = activationOpt.get();
            if (!activation.isActive()) {
                return createErrorResponse("Activación inactiva");
            }
            
            // Licencia válida
            return createLicenseResponse(license, "Licencia válida");
            
        } catch (Exception e) {
            return createErrorResponse("Error validando licencia: " + e.getMessage());
        }
    }
    
    /**
     * Genera un código de licencia único
     */
    private String generateLicenseCode() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = String.valueOf(System.currentTimeMillis());
        String combined = uuid + timestamp;
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(combined.getBytes(StandardCharsets.UTF_8));
            
            // Convertir a formato legible (4 grupos de 4 caracteres)
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 16; i += 4) {
                if (i > 0) sb.append("-");
                sb.append(String.format("%04X", 
                    ((hash[i] & 0xFF) << 24) | 
                    ((hash[i+1] & 0xFF) << 16) | 
                    ((hash[i+2] & 0xFF) << 8) | 
                    (hash[i+3] & 0xFF)));
            }
            
            return "LIC-" + sb.toString();
            
        } catch (Exception e) {
            // Fallback simple
            return "LIC-" + uuid.substring(0, 8).toUpperCase() + "-" + 
                   uuid.substring(8, 16).toUpperCase() + "-" + 
                   uuid.substring(16, 24).toUpperCase();
        }
    }
    
    /**
     * Crea una respuesta de licencia válida
     */
    private LicenseResponseDTO createLicenseResponse(License license, String message) {
        LicenseResponseDTO response = new LicenseResponseDTO();
        response.setLicenseCode(license.getLicenseCode());
        response.setType(license.getType());
        response.setCreatedAt(license.getCreatedAt());
        response.setExpiresAt(license.getExpiresAt());
        response.setValid(license.isValid());
        response.setDaysRemaining(license.getDaysRemaining());
        response.setClientName(license.getClientName());
        response.setMessage(message);
        return response;
    }
    
    /**
     * Crea una respuesta de error
     */
    private LicenseResponseDTO createErrorResponse(String message) {
        LicenseResponseDTO response = new LicenseResponseDTO();
        response.setValid(false);
        response.setMessage(message);
        return response;
    }
    
    /**
     * Encripta un texto usando AES
     */
    public String encrypt(String text) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
            byte[] encrypted = cipher.doFinal(text.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error encriptando texto", e);
        }
    }
    
    /**
     * Desencripta un texto usando AES
     */
    public String decrypt(String encryptedText) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Error desencriptando texto", e);
        }
    }
    
    /**
     * Genera un fingerprint único para el equipo
     */
    public String generateFingerprint(String machineInfo) {
        try {
            String combined = machineInfo + fingerprintSalt;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(combined.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 16; i += 4) {
                if (i > 0) sb.append("-");
                sb.append(String.format("%04X", 
                    ((hash[i] & 0xFF) << 24) | 
                    ((hash[i+1] & 0xFF) << 16) | 
                    ((hash[i+2] & 0xFF) << 8) | 
                    (hash[i+3] & 0xFF)));
            }
            
            return "FP-" + sb.toString();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generando fingerprint", e);
        }
    }
} 