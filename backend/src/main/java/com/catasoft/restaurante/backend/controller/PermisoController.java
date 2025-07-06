package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.model.Permiso;
import com.catasoft.restaurante.backend.model.Rol;
import com.catasoft.restaurante.backend.service.PermisoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/permisos")
@PreAuthorize("hasAuthority('GESTIONAR_ROLES')")
public class PermisoController {
    
    private final PermisoService permisoService;
    
    @Autowired
    public PermisoController(PermisoService permisoService) {
        this.permisoService = permisoService;
    }
    
    // Endpoints para Permisos
    @GetMapping
    public List<Permiso> getAllPermisos() {
        return permisoService.getAllPermisos();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Permiso> getPermisoById(@PathVariable Long id) {
        return permisoService.getPermisoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Permiso createPermiso(@RequestBody Permiso permiso) {
        return permisoService.createPermiso(permiso);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Permiso> updatePermiso(@PathVariable Long id, @RequestBody Permiso permisoDetails) {
        try {
            Permiso updatedPermiso = permisoService.updatePermiso(id, permisoDetails);
            return ResponseEntity.ok(updatedPermiso);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermiso(@PathVariable Long id) {
        try {
            permisoService.deletePermiso(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Endpoints para Roles
    @GetMapping("/roles")
    public List<Rol> getAllRoles() {
        return permisoService.getAllRoles();
    }
    
    @GetMapping("/roles/{id}")
    public ResponseEntity<Rol> getRolById(@PathVariable Long id) {
        return permisoService.getRolById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/roles")
    public Rol createRol(@RequestBody Rol rol) {
        return permisoService.createRol(rol);
    }
    
    @PutMapping("/roles/{id}")
    public ResponseEntity<Rol> updateRol(@PathVariable Long id, @RequestBody Rol rolDetails) {
        try {
            Rol updatedRol = permisoService.updateRol(id, rolDetails);
            return ResponseEntity.ok(updatedRol);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRol(@PathVariable Long id) {
        try {
            permisoService.deleteRol(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Endpoints para gestionar permisos de roles
    @GetMapping("/roles/{rolId}/permisos")
    public Set<Permiso> getPermisosDeRol(@PathVariable Long rolId) {
        return permisoService.getPermisosDeRol(rolId);
    }
    
    @PostMapping("/roles/{rolId}/permisos/{permisoId}")
    public ResponseEntity<Void> asignarPermisoARol(@PathVariable Long rolId, @PathVariable Long permisoId) {
        try {
            permisoService.asignarPermisoARol(rolId, permisoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/roles/{rolId}/permisos/{permisoId}")
    public ResponseEntity<Void> removerPermisoDeRol(@PathVariable Long rolId, @PathVariable Long permisoId) {
        try {
            permisoService.removerPermisoDeRol(rolId, permisoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Endpoint para inicializar permisos y roles (solo para desarrollo)
    @PostMapping("/inicializar")
    @PreAuthorize("hasAuthority('GESTIONAR_ROLES')")
    public ResponseEntity<String> inicializarPermisosYRoles() {
        try {
            permisoService.inicializarPermisosYRoles();
            return ResponseEntity.ok("Permisos y roles inicializados correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al inicializar: " + e.getMessage());
        }
    }
} 