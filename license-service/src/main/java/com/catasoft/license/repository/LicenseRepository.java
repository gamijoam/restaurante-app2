package com.catasoft.license.repository;

import com.catasoft.license.model.License;
import com.catasoft.license.model.LicenseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseRepository extends JpaRepository<License, Long> {
    
    Optional<License> findByLicenseCode(String licenseCode);
    
    List<License> findByType(LicenseType type);
    
    List<License> findByActive(boolean active);
    
    @Query("SELECT l FROM License l WHERE l.active = true AND l.expiresAt < :now")
    List<License> findExpiredLicenses(@Param("now") LocalDateTime now);
    
    @Query("SELECT l FROM License l WHERE l.active = true AND l.expiresAt BETWEEN :now AND :future")
    List<License> findLicensesExpiringSoon(@Param("now") LocalDateTime now, @Param("future") LocalDateTime future);
    
    boolean existsByLicenseCode(String licenseCode);
    
    @Query("SELECT COUNT(l) FROM License l WHERE l.active = true")
    long countActiveLicenses();
    
    @Query("SELECT COUNT(l) FROM License l WHERE l.type = :type AND l.active = true")
    long countActiveLicensesByType(@Param("type") LicenseType type);
} 