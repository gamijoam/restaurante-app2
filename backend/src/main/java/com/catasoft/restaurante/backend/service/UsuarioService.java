package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.dto.UsuarioResponseDTO;
import com.catasoft.restaurante.backend.model.Permission;
import com.catasoft.restaurante.backend.model.Usuario;
import com.catasoft.restaurante.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    
    @Autowired
    private PermissionService permissionService;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioResponseDTO> getAllUsers() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToUsuarioResponseDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<Usuario> getUserById(Long id) {
        return usuarioRepository.findById(id);
    }
    
    public Usuario updateUserPermissions(Long userId, Set<Long> permissionIds) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Limpiar permisos actuales
        usuario.getPermisos().clear();
        
        // Agregar nuevos permisos
        for (Long permissionId : permissionIds) {
            Permission permission = permissionService.getPermissionById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado: " + permissionId));
            usuario.getPermisos().add(permission);
        }
        
        return usuarioRepository.save(usuario);
    }
    
    public Set<Permission> getUserPermissions(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getPermisos();
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