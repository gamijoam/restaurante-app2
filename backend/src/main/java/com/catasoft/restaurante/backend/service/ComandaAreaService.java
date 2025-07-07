package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.ComandaArea;
import com.catasoft.restaurante.backend.model.ComandaAreaItem;
import com.catasoft.restaurante.backend.model.ComandaArea.EstadoComandaArea;
import com.catasoft.restaurante.backend.repository.ComandaAreaRepository;
import com.catasoft.restaurante.backend.repository.ComandaAreaItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComandaAreaService {
    @Autowired
    private ComandaAreaRepository comandaAreaRepository;
    @Autowired
    private ComandaAreaItemRepository comandaAreaItemRepository;

    public List<ComandaArea> findAll() {
        return comandaAreaRepository.findAll();
    }

    public Optional<ComandaArea> findById(Long id) {
        return comandaAreaRepository.findById(id);
    }

    public List<ComandaArea> findByAreaIdAndStatus(String areaId, EstadoComandaArea status) {
        return comandaAreaRepository.findByAreaIdAndStatus(areaId, status);
    }

    public ComandaArea save(ComandaArea ca) {
        return comandaAreaRepository.save(ca);
    }

    public void delete(Long id) {
        comandaAreaRepository.deleteById(id);
    }

    // --- Items ---
    public List<ComandaAreaItem> findItemsByComandaAreaId(Long comandaAreaId) {
        return comandaAreaItemRepository.findByComandaAreaId(comandaAreaId);
    }

    public ComandaAreaItem saveItem(ComandaAreaItem item) {
        return comandaAreaItemRepository.save(item);
    }

    public void deleteItem(Long id) {
        comandaAreaItemRepository.deleteById(id);
    }
} 