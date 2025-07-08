package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.license.LicenseValidationRequest;
import com.catasoft.restaurante.backend.dto.license.LicenseValidationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LicenseClientService {
    
    @Value("${license.service.url:http://localhost:8081}")
    private String licenseServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public LicenseClientService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Valida una licencia con el microservicio
     */
    public LicenseValidationResponse validateLicense(String licenseCode, String fingerprint) {
        try {
            String url = licenseServiceUrl + "/api/license/validate";
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("licenseCode", licenseCode);
            requestBody.put("fingerprint", fingerprint);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<LicenseValidationResponse> response = restTemplate.postForEntity(
                url, request, LicenseValidationResponse.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                return createErrorResponse("Error en la comunicación con el servicio de licencias");
            }
            
        } catch (Exception e) {
            return createErrorResponse("Error validando licencia: " + e.getMessage());
        }
    }
    
    /**
     * Obtiene el estado de una licencia
     */
    public LicenseValidationResponse getLicenseStatus(String licenseCode) {
        try {
            String url = licenseServiceUrl + "/api/license/status/" + licenseCode;
            
            ResponseEntity<LicenseValidationResponse> response = restTemplate.getForEntity(
                url, LicenseValidationResponse.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                return createErrorResponse("Error obteniendo estado de licencia");
            }
            
        } catch (Exception e) {
            return createErrorResponse("Error obteniendo estado: " + e.getMessage());
        }
    }
    
    /**
     * Verifica si el servicio de licencias está disponible
     */
    public boolean isLicenseServiceAvailable() {
        try {
            String url = licenseServiceUrl + "/api/license/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Crea una respuesta de error
     */
    private LicenseValidationResponse createErrorResponse(String message) {
        LicenseValidationResponse response = new LicenseValidationResponse();
        response.setValid(false);
        response.setMessage(message);
        return response;
    }
} 