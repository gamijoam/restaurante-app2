package com.catasoft.restaurante.backend.dto.auth;

public class RegisterRequestDTO {
    private String username;
    private String password;
    private String nombre;
    private String email; // <-- CAMPO AÑADIDO

    // Getters y Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; } // <-- GETTER Y SETTER AÑADIDOS
    public void setEmail(String email) { this.email = email; }
}