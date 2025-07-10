package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.TicketTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketTemplateRepository extends JpaRepository<TicketTemplate, Long> {
    
    List<TicketTemplate> findByAreaId(String areaId);
    
    Optional<TicketTemplate> findByAreaIdAndIsDefaultTrue(String areaId);
    
    Optional<TicketTemplate> findFirstByAreaIdOrderByCreatedAtDesc(String areaId);
    
    boolean existsByAreaId(String areaId);

    @Modifying
    @Transactional
    @Query("UPDATE TicketTemplate t SET t.isDefault = false WHERE t.areaId = :areaId")
    void clearDefaultForArea(String areaId);
} 