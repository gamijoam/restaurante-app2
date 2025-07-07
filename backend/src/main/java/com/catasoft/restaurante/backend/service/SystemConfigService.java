package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.SystemConfig;
import com.catasoft.restaurante.backend.repository.SystemConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class SystemConfigService {
    private final SystemConfigRepository systemConfigRepository;

    public static final String CLAVE_IMPUESTO = "IMPUESTO";

    public SystemConfigService(SystemConfigRepository systemConfigRepository) {
        this.systemConfigRepository = systemConfigRepository;
    }

    @Transactional(readOnly = true)
    public BigDecimal getImpuesto() {
        return systemConfigRepository.findByClave(CLAVE_IMPUESTO)
                .map(SystemConfig::getValorDecimal)
                .orElse(new BigDecimal("0.16")); // Valor por defecto 16%
    }

    @Transactional
    public void setImpuesto(BigDecimal nuevoImpuesto) {
        SystemConfig config = systemConfigRepository.findByClave(CLAVE_IMPUESTO)
                .orElse(new SystemConfig(CLAVE_IMPUESTO, nuevoImpuesto.toPlainString()));
        config.setValor(nuevoImpuesto.toPlainString());
        systemConfigRepository.save(config);
    }
} 