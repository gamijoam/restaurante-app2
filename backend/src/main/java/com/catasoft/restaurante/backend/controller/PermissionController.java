package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.Permission;
import com.catasoft.restaurante.backend.model.Usuario;
import com.catasoft.restaurante.backend.service.PermissionService;
import com.catasoft.restaurante.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/permisos")
@PreAuthorize("hasAuthority('GESTIONAR_ROLES')")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;
    
    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Permission> getPermissionById(@PathVariable Long id) {
        return permissionService.getPermissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Permission> createPermission(@RequestBody Permission permission) {
        try {
            Permission createdPermission = permissionService.createPermission(permission);
            return ResponseEntity.ok(createdPermission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Permission> updatePermission(@PathVariable Long id, @RequestBody Permission permission) {
        try {
            Permission updatedPermission = permissionService.updatePermission(id, permission);
            return ResponseEntity.ok(updatedPermission);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        try {
            permissionService.deletePermission(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<Set<Permission>> getUserPermissions(@PathVariable Long userId) {
        try {
            Set<Permission> permissions = usuarioService.getUserPermissions(userId);
            return ResponseEntity.ok(permissions);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/usuario/{userId}")
    public ResponseEntity<Usuario> updateUserPermissions(
            @PathVariable Long userId, 
            @RequestBody Set<Long> permissionIds) {
        try {
            Usuario updatedUser = usuarioService.updateUserPermissions(userId, permissionIds);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 