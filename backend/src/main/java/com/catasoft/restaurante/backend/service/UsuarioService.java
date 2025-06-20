package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.UsuarioResponseDTO;
import com.catasoft.restaurante.backend.model.Usuario;
import com.catasoft.restaurante.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioResponseDTO> getAllUsers() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToUsuarioResponseDTO)
                .collect(Collectors.toList());
    }

    private UsuarioResponseDTO mapToUsuarioResponseDTO(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setUsername(usuario.getUsername());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setActivo(usuario.isActivo());
        dto.setRoles(usuario.getRoles());
        dto.setFechaCreacion(usuario.getFechaCreacion());
        return dto;
    }
}