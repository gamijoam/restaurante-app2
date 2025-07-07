package com.catasoft.restaurante.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import java.util.stream.Collectors;

@RestController
public class TestController {

    @GetMapping("/ping")
    public String ping() {
        return "Pong!";
    }

    @GetMapping("/test/auth")
    public String testAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            String authorities = auth.getAuthorities().stream()
                .map(Object::toString)
                .collect(Collectors.joining(", "));
            return "Usuario: " + auth.getName() + ", Autoridades: " + authorities;
        }
        return "No autenticado";
    }

    @GetMapping("/test/recetas/{productoId}")
    public String testRecetas(@PathVariable Long productoId) {
        try {
            // Aquí puedes agregar lógica para probar el servicio de recetas
            return "Endpoint de prueba para recetas del producto: " + productoId;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/productos")
    public String testProductos() {
        try {
            // Aquí puedes agregar lógica para probar el servicio de productos
            return "Endpoint de prueba para productos";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/test/password")
    public String testPassword() {
        try {
            // Generar hash de "admin123" para verificar
            org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            String hash = encoder.encode("admin123");
            return "Hash de 'admin123': " + hash;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}