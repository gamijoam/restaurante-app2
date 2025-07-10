package com.catasoft.restaurante.backend.config;

import com.catasoft.restaurante.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Permitimos auth, websockets Y NUESTRO PING DE PRUEBA
                .requestMatchers("/api/auth/**", "/ws/**", "/ping", "/test/**").permitAll()
                .requestMatchers("/api/license/**").permitAll()
                .requestMatchers("/api/v1/business-config/**").permitAll() // Temporal para pruebas
                // Endpoints que requieren permisos específicos
                .requestMatchers("/api/v1/reportes/**").hasAuthority("VER_REPORTES")
                .requestMatchers("/api/v1/productos/**").hasAuthority("GESTIONAR_INGREDIENTES")
                .requestMatchers("/api/v1/usuarios/**").hasAuthority("CREAR_USUARIOS")
                .requestMatchers("/api/v1/mesas/**").hasAuthority("GESTIONAR_MESAS")
                .requestMatchers("/api/v1/facturas/**").hasAuthority("VER_FACTURAS")
                .requestMatchers("/api/v1/ingredientes/**").hasAuthority("GESTIONAR_INGREDIENTES")
                .requestMatchers("/api/v1/recetas/**").hasAuthority("GESTIONAR_RECETAS")
                .requestMatchers("/api/v1/permisos/**").hasAuthority("GESTIONAR_ROLES")
                .requestMatchers("/api/v1/comandas/**").hasAuthority("TOMAR_PEDIDOS")
                .requestMatchers("/api/v1/cocina/**").hasAuthority("VER_COCINA")
                .requestMatchers("/api/v1/caja/**").hasAuthority("VER_CAJA")
                .requestMatchers("/api/v1/impresoras/**").hasAuthority("CONFIGURAR_IMPRESORAS")
                .requestMatchers("/api/v1/ticket-templates/**").hasRole("GERENTE")
                .requestMatchers("/api/v1/areas/**").hasRole("GERENTE")
                .requestMatchers("/api/v1/product-areas/**").hasRole("GERENTE")
                .requestMatchers("/api/v1/comanda-areas/**").hasRole("GERENTE")
                .requestMatchers("/api/v1/business-config/**").hasRole("GERENTE")
                
                // Cualquier otra petición requiere autenticación
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}