package com.catasoft.restaurante.backend.dto.license;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class LicenseValidationRequest {
    @NotBlank
    @JsonProperty("licenseCode")
    private String licenseCode;

    @NotBlank
    @JsonProperty("fingerprint")
    private String fingerprint;

    public LicenseValidationRequest() {}

    public LicenseValidationRequest(String licenseCode, String fingerprint) {
        this.licenseCode = licenseCode;
        this.fingerprint = fingerprint;
    }

    public String getLicenseCode() {
        return licenseCode;
    }

    public void setLicenseCode(String licenseCode) {
        this.licenseCode = licenseCode;
    }

    public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }
} 