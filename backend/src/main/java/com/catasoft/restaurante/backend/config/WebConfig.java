package com.catasoft.restaurante.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Aplica a toda tu API
                .allowedOrigins(
                    "http://localhost:5173",       // Para desarrollo local
                    "http://localhost:3000",       // Para desarrollo local (Vite)
                    "http://192.168.1.102:5173",  // Para tu IP específica
                    "http://192.168.1.102:3000",  // Para tu IP específica (Vite dev)
                    "http://192.168.1.102",       // Para tu IP específica (sin puerto)
                    "http://192.168.100.64:3000", // IP anterior (por si acaso)
                    "http://192.168.100.64:5173", // IP anterior (por si acaso)
                    "capacitor://localhost",        // Para aplicaciones móviles
                    "ionic://localhost"             // Para aplicaciones Ionic
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight requests for 1 hour
    }
}