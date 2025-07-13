package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.PrinterConfiguration;
import com.catasoft.restaurante.backend.service.PrinterConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/printer-configurations")
@PreAuthorize("hasRole('GERENTE')") // ¡Importante! Solo los gerentes pueden gestionar impresoras.
public class PrinterConfigurationController {

    private final PrinterConfigurationService service;

    @Autowired
    public PrinterConfigurationController(PrinterConfigurationService service) {
        this.service = service;
    }

    /**
     * Endpoint para obtener todas las configuraciones de impresoras.
     * @return Una lista de todas las configuraciones.
     */
    @GetMapping
    public ResponseEntity<List<PrinterConfiguration>> getAllConfigurations() {
        List<PrinterConfiguration> configurations = service.getAllConfigurations();
        // El campo areaId ya está expuesto en el modelo, no se requiere cambio extra
        return ResponseEntity.ok(configurations);
    }

    /**
     * Endpoint para guardar o actualizar una configuración.
     * El cuerpo de la petición debe ser un JSON con la configuración.
     * @param configuration La configuración a guardar.
     * @return La configuración guardada.
     */
    @PostMapping
    public ResponseEntity<PrinterConfiguration> saveConfiguration(@RequestBody PrinterConfiguration configuration) {
        // El campo areaId se recibe y se guarda correctamente
        PrinterConfiguration savedConfiguration = service.saveConfiguration(configuration);
        return new ResponseEntity<>(savedConfiguration, HttpStatus.CREATED);
    }

    /**
     * Endpoint para eliminar una configuración por su ID.
     * @param id El ID de la configuración a eliminar.
     * @return Una respuesta vacía con estado 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable Long id) {
        service.deleteConfiguration(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para verificar si existe una configuración para un rol específico.
     * @param role El rol a verificar.
     * @return La configuración si existe, o 404 si no existe.
     */
    @GetMapping("/check/{role}")
    public ResponseEntity<PrinterConfiguration> checkConfigurationByRole(@PathVariable String role) {
        Optional<PrinterConfiguration> config = service.getConfigurationByRole(role);
        return config.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Endpoint para crear una configuración por defecto para un rol.
     * @param role El rol para el cual crear la configuración.
     * @return La configuración creada.
     */
    @PostMapping("/default/{role}")
    public ResponseEntity<PrinterConfiguration> createDefaultConfiguration(@PathVariable String role) {
        PrinterConfiguration defaultConfig = service.createDefaultConfiguration(role);
        return ResponseEntity.ok(defaultConfig);
    }
}