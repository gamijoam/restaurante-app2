package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.ComandaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComandaItemRepository extends JpaRepository<ComandaItem, Long> {
}