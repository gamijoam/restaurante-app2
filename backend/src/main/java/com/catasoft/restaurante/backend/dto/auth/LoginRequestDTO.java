package com.catasoft.restaurante.backend.dto.auth;
public class LoginRequestDTO {
    private String username;
    private String password;
    // Getters y Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}