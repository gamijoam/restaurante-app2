package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.PrinterConfiguration;
import com.catasoft.restaurante.backend.repository.PrinterConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PrinterConfigurationService {

    private final PrinterConfigurationRepository repository;

    @Autowired
    public PrinterConfigurationService(PrinterConfigurationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PrinterConfiguration> getAllConfigurations() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<PrinterConfiguration> getConfigurationByRole(String role) {
        return repository.findByRole(role.toUpperCase());
    }

    /**
     * Guarda o actualiza una configuración.
     * Si la configuración tiene un ID, la actualiza.
     * Si no tiene ID, la crea, verificando que el rol no esté ya en uso.
     */
    @Transactional
    public PrinterConfiguration saveConfiguration(PrinterConfiguration configuration) {
        // Normalizamos el rol a mayúsculas
        configuration.setRole(configuration.getRole().toUpperCase());

        if (configuration.getId() != null) {
            // --- LÓGICA DE ACTUALIZACIÓN ---
            PrinterConfiguration existingConfig = repository.findById(configuration.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar. Configuración no encontrada con ID: " + configuration.getId()));

            // Verificamos si el nuevo rol ya lo usa OTRA configuración
            Optional<PrinterConfiguration> configWithSameRole = repository.findByRole(configuration.getRole());
            if(configWithSameRole.isPresent() && !configWithSameRole.get().getId().equals(configuration.getId())) {
                throw new IllegalStateException("El rol '" + configuration.getRole() + "' ya está asignado a otra impresora.");
            }

            existingConfig.setRole(configuration.getRole());
            existingConfig.setPrinterType(configuration.getPrinterType());
            existingConfig.setPrinterTarget(configuration.getPrinterTarget());
            return repository.save(existingConfig);

        } else {
            // --- LÓGICA DE CREACIÓN ---
            // Verificamos que el rol no exista antes de crear
            repository.findByRole(configuration.getRole()).ifPresent(c -> {
                throw new IllegalStateException("El rol '" + configuration.getRole() + "' ya existe. Por favor, edítelo.");
            });
            return repository.save(configuration);
        }
    }

    @Transactional
    public void deleteConfiguration(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("No se encontró una configuración de impresora con el ID: " + id);
        }
        repository.deleteById(id);
    }
}