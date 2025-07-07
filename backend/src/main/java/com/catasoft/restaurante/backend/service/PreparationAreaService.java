package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.PreparationArea;

import com.catasoft.restaurante.backend.repository.PreparationAreaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PreparationAreaService {
    @Autowired
    private PreparationAreaRepository preparationAreaRepository;

    public List<PreparationArea> findAll() {
        return preparationAreaRepository.findAll();
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
        return preparationAreaRepository.save(area);
    }

    public void delete(Long id) {
        preparationAreaRepository.deleteById(id);
    }
} 