package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.DolarRateDTO;
import com.catasoft.restaurante.backend.dto.DolarRateRequestDTO;
import com.catasoft.restaurante.backend.model.DolarRate;
import com.catasoft.restaurante.backend.repository.DolarRateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DolarRateService {
    
    private static final Logger logger = LoggerFactory.getLogger(DolarRateService.class);
    
    private final DolarRateRepository dolarRateRepository;
    
    @Autowired
    public DolarRateService(DolarRateRepository dolarRateRepository) {
        this.dolarRateRepository = dolarRateRepository;
    }
    
    /**
     * Obtiene el precio del dólar para una fecha específica
     */
    @Transactional(readOnly = true)
    public Optional<BigDecimal> getPrecioDolar(LocalDate fecha) {
        Optional<DolarRate> dolarRate = dolarRateRepository.findByFechaAndActivoTrue(fecha);
        return dolarRate.map(DolarRate::getPrecioDolar);
    }
    
    /**
     * Obtiene el precio del dólar para hoy
     */
    @Transactional(readOnly = true)
    public Optional<BigDecimal> getPrecioDolarHoy() {
        return getPrecioDolar(LocalDate.now());
    }
    
    /**
     * Obtiene el precio del dólar más reciente disponible
     */
    @Transactional(readOnly = true)
    public Optional<BigDecimal> getPrecioDolarMasReciente() {
        List<DolarRate> latestRates = dolarRateRepository.findLatestRates();
        if (!latestRates.isEmpty()) {
            return Optional.of(latestRates.get(0).getPrecioDolar());
        }
        return Optional.empty();
    }
    
    /**
     * Convierte un precio de USD a Bs usando el precio del dólar de una fecha específica
     */
    @Transactional(readOnly = true)
    public BigDecimal convertirUsdABs(BigDecimal precioUsd, LocalDate fecha) {
        Optional<BigDecimal> precioDolar = getPrecioDolar(fecha);
        if (precioDolar.isPresent()) {
            return precioUsd.multiply(precioDolar.get()).setScale(2, RoundingMode.HALF_UP);
        }
        // Si no hay precio para esa fecha, usar el más reciente
        Optional<BigDecimal> precioReciente = getPrecioDolarMasReciente();
        if (precioReciente.isPresent()) {
            logger.warn("No se encontró precio del dólar para la fecha {}, usando el más reciente", fecha);
            return precioUsd.multiply(precioReciente.get()).setScale(2, RoundingMode.HALF_UP);
        }
        logger.error("No se encontró ningún precio del dólar disponible");
        return BigDecimal.ZERO;
    }
    
    /**
     * Convierte un precio de USD a Bs usando el precio del dólar de hoy
     */
    @Transactional(readOnly = true)
    public BigDecimal convertirUsdABsHoy(BigDecimal precioUsd) {
        return convertirUsdABs(precioUsd, LocalDate.now());
    }
    
    /**
     * Crea o actualiza el precio del dólar para una fecha específica
     */
    @Transactional
    public DolarRateDTO crearOActualizarPrecioDolar(DolarRateRequestDTO request) {
        LocalDate fecha = request.getFecha();
        BigDecimal precioDolar = request.getPrecioDolar();
        
        // Validar que el precio sea positivo
        if (precioDolar.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio del dólar debe ser mayor a 0");
        }
        
        // Buscar si ya existe un precio para esa fecha
        Optional<DolarRate> existingRate = dolarRateRepository.findByFechaAndActivoTrue(fecha);
        
        DolarRate dolarRate;
        if (existingRate.isPresent()) {
            // Actualizar el precio existente
            dolarRate = existingRate.get();
            dolarRate.setPrecioDolar(precioDolar);
            logger.info("Actualizando precio del dólar para {}: ${}", fecha, precioDolar);
        } else {
            // Crear nuevo precio
            dolarRate = new DolarRate(fecha, precioDolar);
            logger.info("Creando nuevo precio del dólar para {}: ${}", fecha, precioDolar);
        }
        
        DolarRate savedRate = dolarRateRepository.save(dolarRate);
        return mapToDTO(savedRate);
    }
    
    /**
     * Obtiene todos los precios del dólar activos ordenados por fecha descendente
     */
    @Transactional(readOnly = true)
    public List<DolarRateDTO> getAllPreciosDolar() {
        List<DolarRate> dolarRates = dolarRateRepository.findAllActiveOrderByFechaDesc();
        return dolarRates.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene un precio del dólar por ID
     */
    @Transactional(readOnly = true)
    public Optional<DolarRateDTO> getPrecioDolarById(Long id) {
        return dolarRateRepository.findById(id)
                .map(this::mapToDTO);
    }
    
    /**
     * Desactiva un precio del dólar
     */
    @Transactional
    public void desactivarPrecioDolar(Long id) {
        Optional<DolarRate> dolarRate = dolarRateRepository.findById(id);
        if (dolarRate.isPresent()) {
            DolarRate rate = dolarRate.get();
            rate.setActivo(false);
            dolarRateRepository.save(rate);
            logger.info("Precio del dólar desactivado: ID {}", id);
        } else {
            throw new IllegalArgumentException("Precio del dólar no encontrado con ID: " + id);
        }
    }
    
    /**
     * Mapea la entidad a DTO
     */
    private DolarRateDTO mapToDTO(DolarRate dolarRate) {
        return new DolarRateDTO(
                dolarRate.getId(),
                dolarRate.getFecha(),
                dolarRate.getPrecioDolar(),
                dolarRate.getActivo(),
                dolarRate.getFechaCreacion(),
                dolarRate.getFechaActualizacion()
        );
    }
} 