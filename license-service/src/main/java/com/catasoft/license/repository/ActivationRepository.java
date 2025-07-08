package com.catasoft.license.repository;

import com.catasoft.license.model.Activation;
import com.catasoft.license.model.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivationRepository extends JpaRepository<Activation, Long> {
    
    Optional<Activation> findByFingerprint(String fingerprint);
    
    List<Activation> findByLicense(License license);
    
    List<Activation> findByActive(boolean active);
    
    @Query("SELECT a FROM Activation a WHERE a.license.licenseCode = :licenseCode AND a.fingerprint = :fingerprint")
    Optional<Activation> findByLicenseCodeAndFingerprint(@Param("licenseCode") String licenseCode, @Param("fingerprint") String fingerprint);
    
    @Query("SELECT a FROM Activation a WHERE a.license.licenseCode = :licenseCode")
    List<Activation> findByLicenseCode(@Param("licenseCode") String licenseCode);
    
    boolean existsByFingerprint(String fingerprint);
    
    @Query("SELECT COUNT(a) FROM Activation a WHERE a.active = true")
    long countActiveActivations();

    List<Activation> findAllByFingerprint(String fingerprint);
} 