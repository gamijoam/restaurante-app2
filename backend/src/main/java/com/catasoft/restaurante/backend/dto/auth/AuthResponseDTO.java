package com.catasoft.restaurante.backend.dto.auth;
public class AuthResponseDTO {
    private String token;
    public AuthResponseDTO(String token) { this.token = token; }
    // Getter y Setter
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}