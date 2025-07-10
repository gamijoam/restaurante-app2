package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.BusinessConfigDTO;
import com.catasoft.restaurante.backend.model.BusinessConfig;
import com.catasoft.restaurante.backend.repository.BusinessConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BusinessConfigService {
    
    private static final Logger logger = LoggerFactory.getLogger(BusinessConfigService.class);
    
    @Autowired
    private BusinessConfigRepository businessConfigRepository;
    
    /**
     * Obtener la configuración activa del negocio
     */
    public BusinessConfigDTO getActiveConfig() {
        logger.info("Iniciando búsqueda de configuración activa");
        
        // Buscar todas las configuraciones y encontrar la activa
        List<BusinessConfig> allConfigs = businessConfigRepository.findAll();
        logger.info("Total de configuraciones encontradas: {}", allConfigs.size());
        
        // Mostrar información de cada configuración
        for (BusinessConfig config : allConfigs) {
            logger.info("Configuración ID: {}, Nombre: {}, Activa: {}", 
                config.getId(), config.getBusinessName(), config.getIsActive());
        }
        
        // Buscar la configuración activa
        Optional<BusinessConfig> activeConfig = allConfigs.stream()
            .filter(config -> Boolean.TRUE.equals(config.getIsActive()))
            .findFirst();
            
        if (activeConfig.isPresent()) {
            logger.info("Configuración activa encontrada: {}", activeConfig.get().getBusinessName());
            return mapToDTO(activeConfig.get());
        }
        
        logger.info("No se encontró configuración activa, devolviendo configuración por defecto");
        // Si no hay configuración activa, devolver configuración por defecto
        return getDefaultConfig();
    }
    
    /**
     * Guardar o actualizar la configuración del negocio
     */
    @Transactional
    public BusinessConfigDTO saveConfig(BusinessConfigDTO configDTO) {
        // Si se va a activar esta configuración, desactivar las demás
        if (Boolean.TRUE.equals(configDTO.getIsActive())) {
            businessConfigRepository.findAll().forEach(config -> {
                config.setIsActive(false);
                businessConfigRepository.save(config);
            });
        }
        
        BusinessConfig config;
        if (configDTO.getId() != null) {
            // Actualizar configuración existente
            config = businessConfigRepository.findById(configDTO.getId())
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));
        } else {
            // Crear nueva configuración
            config = new BusinessConfig();
        }
        
        // Mapear datos del DTO a la entidad
        config.setBusinessName(configDTO.getBusinessName());
        config.setTaxId(configDTO.getTaxId());
        config.setAddress(configDTO.getAddress());
        config.setPhone(configDTO.getPhone());
        config.setEmail(configDTO.getEmail());
        config.setWebsite(configDTO.getWebsite());
        config.setLogoUrl(configDTO.getLogoUrl());
        config.setDescription(configDTO.getDescription());
        config.setTaxRate(configDTO.getTaxRate());
        config.setCurrency(configDTO.getCurrency());
        config.setIsActive(configDTO.getIsActive());
        
        config = businessConfigRepository.save(config);
        return mapToDTO(config);
    }
    
    /**
     * Obtener configuración por defecto
     */
    private BusinessConfigDTO getDefaultConfig() {
        return new BusinessConfigDTO(
            null,
            "Mi Restaurante",
            "J-12345678-9",
            "Calle Principal #123, Ciudad",
            "(555) 123-4567",
            "info@mirestaurante.com",
            "www.mirestaurante.com",
            null,
            "Restaurante de comida tradicional",
            new BigDecimal("16.00"),
            "USD",
            true,
            null,
            null
        );
    }
    
    /**
     * Mapear entidad a DTO
     */
    private BusinessConfigDTO mapToDTO(BusinessConfig config) {
        return new BusinessConfigDTO(
            config.getId(),
            config.getBusinessName(),
            config.getTaxId(),
            config.getAddress(),
            config.getPhone(),
            config.getEmail(),
            config.getWebsite(),
            config.getLogoUrl(),
            config.getDescription(),
            config.getTaxRate(),
            config.getCurrency(),
            config.getIsActive(),
            config.getCreatedAt(),
            config.getUpdatedAt()
        );
    }
} 