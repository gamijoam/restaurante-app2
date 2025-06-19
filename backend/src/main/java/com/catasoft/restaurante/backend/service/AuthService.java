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
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        UserDetails user = (UserDetails) usuarioRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthResponseDTO(token);
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        // Por defecto, asignamos el rol de CAMARERO a los nuevos usuarios.
        usuario.setRoles(Set.of(Rol.ROLE_CAMARERO));

        usuarioRepository.save(usuario);

        UserDetails user = (UserDetails) usuarioRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthResponseDTO(token);
    }
}