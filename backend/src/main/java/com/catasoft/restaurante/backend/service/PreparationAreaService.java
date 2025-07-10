package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.PreparationArea;
import com.catasoft.restaurante.backend.model.Area;

import com.catasoft.restaurante.backend.repository.PreparationAreaRepository;
import com.catasoft.restaurante.backend.repository.AreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class PreparationAreaService {
    @Autowired
    private PreparationAreaRepository preparationAreaRepository;
    @Autowired
    private AreaRepository areaRepository;

    public List<PreparationArea> findAll() {
        List<PreparationArea> areas = new ArrayList<>(preparationAreaRepository.findAll());
        boolean existsCaja = areas.stream().anyMatch(a -> "CAJA".equalsIgnoreCase(a.getAreaId()));
        if (!existsCaja) {
            PreparationArea caja = new PreparationArea();
            caja.setAreaId("CAJA");
            caja.setName("Caja");
            caja.setType("CAJA");
            caja.setActive(true);
            caja.setOrderIndex(999);
            areas.add(caja);
        }
        return areas;
    }

    public List<PreparationArea> findActive() {
        return preparationAreaRepository.findByActiveTrueOrderByOrderIndexAsc();
    }

    public Optional<PreparationArea> findById(Long id) {
        return preparationAreaRepository.findById(id);
    }

    public Optional<PreparationArea> findByAreaId(String areaId) {
        return preparationAreaRepository.findByAreaId(areaId);
    }

    public List<PreparationArea> findByType(String type) {
        return preparationAreaRepository.findByType(type);
    }

    public PreparationArea save(PreparationArea area) {
        if (area.getCreatedAt() == null) {
            area.setCreatedAt(java.time.LocalDateTime.now());
        }
        if (area.getUpdatedAt() == null) {
            area.setUpdatedAt(java.time.LocalDateTime.now());
        }
        PreparationArea saved = preparationAreaRepository.save(area);

        // Sincronizar con tabla areas
        Area areaEntity = areaRepository.findByAreaId(area.getAreaId())
            .orElseGet(() -> new Area());
        areaEntity.setAreaId(area.getAreaId());
        areaEntity.setName(area.getName());
        areaEntity.setDescription(area.getDescription());
        areaEntity.setCreatedAt(saved.getCreatedAt());
        areaEntity.setUpdatedAt(saved.getUpdatedAt());
        areaRepository.save(areaEntity);

        return saved;
    }

    public void delete(Long id) {
        preparationAreaRepository.deleteById(id);
    }
} 