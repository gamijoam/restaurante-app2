package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.Permission;
import com.catasoft.restaurante.backend.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PermissionService {
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    public List<Permission> getAllPermissions() {
        return permissionRepository.findByActivoTrue();
    }
    
    public Optional<Permission> getPermissionById(Long id) {
        return permissionRepository.findById(id);
    }
    
    public Optional<Permission> getPermissionByName(String nombre) {
        return permissionRepository.findByNombre(nombre);
    }
    
    public Permission createPermission(Permission permission) {
        if (permissionRepository.existsByNombre(permission.getNombre())) {
            throw new RuntimeException("Ya existe un permiso con ese nombre");
        }
        return permissionRepository.save(permission);
    }
    
    public Permission updatePermission(Long id, Permission permissionDetails) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        
        permission.setNombre(permissionDetails.getNombre());
        permission.setDescripcion(permissionDetails.getDescripcion());
        permission.setActivo(permissionDetails.isActivo());
        
        return permissionRepository.save(permission);
    }
    
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        
        permission.setActivo(false);
        permissionRepository.save(permission);
    }
    
    public List<Permission> getPermissionsByUser(Long userId) {
        // Esta implementación se completará cuando tengamos el servicio de usuario actualizado
        return permissionRepository.findByActivoTrue();
    }
} 