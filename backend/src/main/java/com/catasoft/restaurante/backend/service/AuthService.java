package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.auth.AuthResponseDTO;
import com.catasoft.restaurante.backend.dto.auth.LoginRequestDTO;
import com.catasoft.restaurante.backend.dto.auth.RegisterRequestDTO;
import com.catasoft.restaurante.backend.model.Usuario;
import com.catasoft.restaurante.backend.model.enums.Rol;
import com.catasoft.restaurante.backend.repository.UsuarioRepository;
import com.catasoft.restaurante.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.util.Set;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UsuarioRepository usuarioRepository, JwtService jwtService, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        Usuario user = usuarioRepository.findByUsername(request.getUsername()).orElseThrow();
        // Ahora pasamos el objeto Usuario directamente
        String token = jwtService.generateToken(user);
        return new AuthResponseDTO(token);
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
    
        // Convertimos los roles de String a nuestro Enum Rol
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            // Si no se especifican roles, se asigna CAMARERO por defecto
            usuario.setRoles(Set.of(Rol.ROLE_CAMARERO));
        } else {
            Set<Rol> roles = request.getRoles().stream()
                    .map(rol -> Rol.valueOf("ROLE_" + rol.toUpperCase()))
                    .collect(Collectors.toSet());
            usuario.setRoles(roles);
        }
    
        usuarioRepository.save(usuario);
    
        String token = jwtService.generateToken(usuario);
        return new AuthResponseDTO(token);
    }
}