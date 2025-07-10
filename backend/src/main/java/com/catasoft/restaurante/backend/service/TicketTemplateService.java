package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.TicketBlockDTO;
import com.catasoft.restaurante.backend.dto.TicketTemplateDTO;
import com.catasoft.restaurante.backend.model.Area;
import com.catasoft.restaurante.backend.model.TicketBlock;
import com.catasoft.restaurante.backend.model.TicketTemplate;
import com.catasoft.restaurante.backend.repository.AreaRepository;
import com.catasoft.restaurante.backend.repository.TicketTemplateRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TicketTemplateService {
    
    @Autowired
    private TicketTemplateRepository ticketTemplateRepository;
    
    @Autowired
    private AreaRepository areaRepository;
    
    @Autowired
    private com.catasoft.restaurante.backend.repository.PreparationAreaRepository preparationAreaRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Obtener todas las áreas
    public List<Area> getAllAreas() {
        List<com.catasoft.restaurante.backend.model.PreparationArea> prepAreas = preparationAreaRepository.findAll();
        List<Area> areas = new ArrayList<>();
        
        for (com.catasoft.restaurante.backend.model.PreparationArea prepArea : prepAreas) {
            Area area = new Area();
            area.setId(prepArea.getId());
            area.setAreaId(prepArea.getAreaId());
            area.setName(prepArea.getName());
            area.setDescription(prepArea.getDescription());
            areas.add(area);
        }
        
        return areas;
    }
    
    // Crear nueva área
    @Transactional
    public Area createArea(Area area) {
        // Generar areaId si no se proporciona
        if (area.getAreaId() == null || area.getAreaId().trim().isEmpty()) {
            area.setAreaId(generateAreaId(area.getName()));
        }
        
        // Verificar que el areaId sea único
        if (preparationAreaRepository.existsByAreaId(area.getAreaId())) {
            throw new RuntimeException("El área con ID '" + area.getAreaId() + "' ya existe");
        }
        
        // Crear en la tabla de áreas de preparación
        com.catasoft.restaurante.backend.model.PreparationArea prepArea = new com.catasoft.restaurante.backend.model.PreparationArea();
        prepArea.setAreaId(area.getAreaId());
        prepArea.setName(area.getName());
        prepArea.setDescription(area.getDescription());
        prepArea.setType("CUSTOM");
        prepArea.setActive(true);
        prepArea.setOrderIndex(999);
        
        prepArea = preparationAreaRepository.save(prepArea);
        
        // Convertir de vuelta a Area
        area.setId(prepArea.getId());
        return area;
    }
    
    // Obtener plantilla por área
    public TicketTemplateDTO getTemplateByArea(String areaId) {
        // Mapear IDs de áreas de preparación a IDs de ticket templates
        String templateAreaId = mapPreparationAreaToTemplateArea(areaId);
        
        Optional<TicketTemplate> template = ticketTemplateRepository.findByAreaIdAndIsDefaultTrue(templateAreaId);
        
        if (template.isPresent()) {
            return convertToDTO(template.get());
        }
        
        // Si no hay plantilla por defecto, buscar la más reciente
        template = ticketTemplateRepository.findFirstByAreaIdOrderByCreatedAtDesc(templateAreaId);
        
        if (template.isPresent()) {
            return convertToDTO(template.get());
        }
        
        return null;
    }
    
    // Método para mapear IDs de áreas de preparación a IDs de ticket templates
    private String mapPreparationAreaToTemplateArea(String preparationAreaId) {
        if (preparationAreaId == null) {
            return null;
        }
        
        // Mapear IDs de preparación (mayúsculas) a IDs de templates (minúsculas)
        switch (preparationAreaId.toUpperCase()) {
            case "COCINA":
                return "cocina";
            case "CAJA":
                return "caja";
            case "BARRA":
                return "barra";
            default:
                // Si no hay mapeo específico, convertir a minúsculas
                return preparationAreaId.toLowerCase();
        }
    }
    
    // Método para mapear IDs de ticket templates a IDs de áreas de preparación
    private String mapTemplateAreaToPreparationArea(String templateAreaId) {
        if (templateAreaId == null) {
            return null;
        }
        
        // Mapear IDs de templates (minúsculas) a IDs de preparación (mayúsculas)
        switch (templateAreaId.toLowerCase()) {
            case "cocina":
                return "COCINA";
            case "caja":
                return "CAJA";
            case "barra":
                return "BARRA";
            default:
                // Si no hay mapeo específico, convertir a mayúsculas
                return templateAreaId.toUpperCase();
        }
    }
    
    // Obtener plantilla por ID
    public TicketTemplateDTO getTemplateById(Long id) {
        Optional<TicketTemplate> template = ticketTemplateRepository.findById(id);
        return template.map(this::convertToDTO).orElse(null);
    }
    
    // Guardar plantilla
    @Transactional
    public TicketTemplateDTO saveTemplate(TicketTemplateDTO templateDTO) {
        TicketTemplate template;
        boolean setAsDefault = templateDTO.getIsDefault() != null && templateDTO.getIsDefault();
        
        // Mapear el área ID para guardar en la tabla de templates
        String templateAreaId = mapPreparationAreaToTemplateArea(templateDTO.getArea());
        
        if (templateDTO.getId() != null) {
            // Actualizar plantilla existente
            Optional<TicketTemplate> existingTemplate = ticketTemplateRepository.findById(templateDTO.getId());
            if (existingTemplate.isPresent()) {
                template = existingTemplate.get();
                template.setName(templateDTO.getName());
                template.setAreaId(templateAreaId);
                template.setIsDefault(templateDTO.getIsDefault());
            } else {
                throw new RuntimeException("Plantilla no encontrada con ID: " + templateDTO.getId());
            }
        } else {
            // Crear nueva plantilla
            template = new TicketTemplate();
            template.setName(templateDTO.getName());
            template.setAreaId(templateAreaId);
            template.setIsDefault(templateDTO.getIsDefault() != null ? templateDTO.getIsDefault() : false);
        }
        // Si se marca como por defecto, desmarcar las demás del área
        if (setAsDefault && templateAreaId != null) {
            ticketTemplateRepository.clearDefaultForArea(templateAreaId);
            template.setIsDefault(true);
        }
        // Guardar la plantilla
        template = ticketTemplateRepository.save(template);
        // Guardar los bloques
        if (templateDTO.getBlocks() != null) {
            saveBlocks(template, templateDTO.getBlocks());
        }
        return convertToDTO(template);
    }
    
    // Obtener todas las plantillas
    public List<TicketTemplateDTO> getAllTemplates() {
        List<TicketTemplate> templates = ticketTemplateRepository.findAll();
        List<TicketTemplateDTO> dtos = new ArrayList<>();
        
        for (TicketTemplate template : templates) {
            dtos.add(convertToDTO(template));
        }
        
        return dtos;
    }
    
    // Eliminar plantilla
    @Transactional
    public void deleteTemplate(Long templateId) {
        if (!ticketTemplateRepository.existsById(templateId)) {
            throw new RuntimeException("Plantilla no encontrada con ID: " + templateId);
        }
        
        ticketTemplateRepository.deleteById(templateId);
    }
    
    // Crear plantilla por defecto para un área
    public TicketTemplateDTO createDefaultTemplate(String areaId, String areaName) {
        List<TicketBlockDTO> defaultBlocks = createDefaultBlocks();
        
        TicketTemplateDTO templateDTO = new TicketTemplateDTO();
        templateDTO.setName("Plantilla " + areaName);
        templateDTO.setArea(areaId); // El área ya viene en formato de preparación
        templateDTO.setIsDefault(true);
        templateDTO.setBlocks(defaultBlocks);
        
        return saveTemplate(templateDTO);
    }
    
    // Métodos privados de conversión
    private TicketTemplateDTO convertToDTO(TicketTemplate template) {
        TicketTemplateDTO dto = new TicketTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        // Mapear el área ID de templates a preparación para el frontend
        dto.setArea(mapTemplateAreaToPreparationArea(template.getAreaId()));
        dto.setIsDefault(template.getIsDefault());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());
        
        // Convertir bloques
        if (template.getBlocks() != null) {
            List<TicketBlockDTO> blockDTOs = new ArrayList<>();
            for (TicketBlock block : template.getBlocks()) {
                blockDTOs.add(convertBlockToDTO(block));
            }
            dto.setBlocks(blockDTOs);
        }
        
        return dto;
    }
    
    private TicketBlockDTO convertBlockToDTO(TicketBlock block) {
        TicketBlockDTO dto = new TicketBlockDTO();
        dto.setId(block.getBlockId());
        dto.setType(block.getType());
        dto.setValue(block.getValue());
        dto.setAlign(block.getAlign());
        dto.setBold(block.getBold());
        dto.setLabel(block.getLabel());
        dto.setField(block.getField());
        dto.setFormat(block.getFormat());
        
        // Convertir columnas JSON si es necesario
        if (block.getColumnsJson() != null && !block.getColumnsJson().isEmpty()) {
            try {
                List<String> columns = objectMapper.readValue(block.getColumnsJson(), new TypeReference<List<String>>() {});
                dto.setColumns(columns);
            } catch (JsonProcessingException e) {
                // Si hay error, dejar columns como null
            }
        }
        
        return dto;
    }
    
    private void saveBlocks(TicketTemplate template, List<TicketBlockDTO> blockDTOs) {
        // Eliminar bloques existentes
        if (template.getBlocks() != null) {
            template.getBlocks().clear();
        }
        
        // Crear nuevos bloques
        List<TicketBlock> blocks = new ArrayList<>();
        for (int i = 0; i < blockDTOs.size(); i++) {
            TicketBlockDTO blockDTO = blockDTOs.get(i);
            TicketBlock block = new TicketBlock();
            
            block.setBlockId(blockDTO.getId());
            block.setType(blockDTO.getType());
            block.setValue(blockDTO.getValue());
            block.setAlign(blockDTO.getAlign());
            block.setBold(blockDTO.getBold());
            block.setLabel(blockDTO.getLabel());
            block.setField(blockDTO.getField());
            block.setFormat(blockDTO.getFormat());
            block.setPosition(i);
            block.setTicketTemplate(template);
            
            // Guardar columnas como JSON si es necesario
            if (blockDTO.getColumns() != null && !blockDTO.getColumns().isEmpty()) {
                try {
                    String columnsJson = objectMapper.writeValueAsString(blockDTO.getColumns());
                    block.setColumnsJson(columnsJson);
                } catch (JsonProcessingException e) {
                    // Si hay error, dejar columnsJson como null
                }
            }
            
            blocks.add(block);
        }
        
        template.setBlocks(blocks);
    }
    
    private List<TicketBlockDTO> createDefaultBlocks() {
        List<TicketBlockDTO> blocks = new ArrayList<>();
        
        // Bloque de título
        blocks.add(new TicketBlockDTO("1", "text", "Restaurante", "center", true));
        
        // Línea separadora
        blocks.add(new TicketBlockDTO("2", "line", null, null, null));
        
        // Fecha y hora
        blocks.add(new TicketBlockDTO("3", "datetime", null, "left", false));
        
        // Tabla de productos
        List<String> columns = List.of("Producto", "Cant", "Precio", "Total");
        TicketBlockDTO tableBlock = new TicketBlockDTO("4", "table", null, null, null);
        tableBlock.setColumns(columns);
        blocks.add(tableBlock);
        
        // Total
        blocks.add(new TicketBlockDTO("5", "total", "Total", "total", null));
        
        // Mensaje de agradecimiento
        blocks.add(new TicketBlockDTO("6", "text", "¡Gracias!", "center", false));
        
        return blocks;
    }
    
    private String generateAreaId(String areaName) {
        // Convertir a minúsculas y reemplazar espacios con guiones
        String baseId = areaName.toLowerCase().replaceAll("\\s+", "-");
        return baseId + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
} 